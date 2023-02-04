const mysql = require("mysql2/promise");

const mysql_pop_times_visits_db_Main = async () => {
  const connection = await mysql.createConnection({
    host: "mysql-pop-times-visits-db-srv",
    user: "root",
    password: "123",
  });

  await connection.beginTransaction();

  await connection.query("drop database if exists pop_times_db", []);

  await connection.query("create database pop_times_db", []);

  await connection.query("use pop_times_db", []);

  await connection.query("SET GLOBAL log_bin_trust_function_creators = 1", []);

  await connection.query("SET GLOBAL event_scheduler = ON", []);

  await connection.query("SET SQL_SAFE_UPDATES = 0", []);

  await connection.query(
    `create table visits (
      id varchar(36) primary key, 
      user_id varchar(36) not null, 
      poi_id varchar(27) not null, 
      visit_date date not null, 
      visit_timestamp timestamp not null)`,
    []
  );

  await connection.query(
    `create table popular_times (
      poi_id varchar(27) not null, 
      day tinyint not null, 
      hour tinyint not null, 
      popularity tinyint not null, 
      primary key (poi_id, day, hour))`,
    []
  );

  await connection.query(
    `CREATE FUNCTION difference (t1 timestamp, t2 timestamp)
    RETURNS INT
    BEGIN
      declare diff int default 0;
      set diff = (timestampdiff(second, t1, t2) <= 3600 and timestampdiff(second, t1, t2) >= 0);
        return diff;
    END`,
    []
  );

  await connection.query(
    `CREATE EVENT custom_event
    ON SCHEDULE EVERY '1' MINUTE
    ON COMPLETION PRESERVE ENABLE
    DO BEGIN
		declare _date timestamp;
        declare _currDate timestamp;
        set _date = '2022-07-25 00:00:00';
        set _currDate = now();
        
        if (mod(timestampdiff(minute, _date, _currDate), 10080) = 0) then
			call update_popular_times();
        end if;
	END`,
    []
  );

  await connection.query(
    `CREATE PROCEDURE update_popular_times()   
    BEGIN 
        declare _currEnd timestamp;
        declare _currStart timestamp;
        declare _end timestamp;
        declare val int;
        declare hourCounter int;
        declare dayCounter int;
        declare max int;
        declare temp int;

      declare poi_id varchar(27);
      declare finished int default 0;
        declare _cursor 
        cursor for
          select poi_id
          from pois;
                
        declare continue handler 
        for not found set finished = 1;

      open _cursor;
        
        pois_loop:
        loop
        fetch _cursor into poi_id;
            
        set _end =  date_add(current_date(), interval 0 hour);
        set _currStart = date_add(date_add(current_date(), interval -7 day), interval 0 hour);
        set _currEnd = date_add(_currStart, interval 1 hour);
        set hourCounter = 1;
        set dayCounter = 1;
        set val = 0;
            set max = 0;
                            
            count_start:
        while (_currEnd < _end) do
          call counter_proc(poi_id, _currEnd, val); -- get the value
                
                if (val > max) then
            set max = val;
          end if;
                
                if (hourCounter < 25) then
            set hourCounter = hourCounter + 1;
          else 
                    set hourCounter = 1;
                    set dayCounter = dayCounter + 1;
                end if;
                
                set _currEnd = date_add(_currEnd, interval 1 hour);
        end while count_start;
            
            --
            --
            --
            
            set _end =  date_add(current_date(), interval 0 hour);
        set _currStart = date_add(date_add(current_date(), interval -7 day), interval 0 hour);
        set _currEnd = date_add(_currStart, interval 1 hour);
        set hourCounter = 1;
        set dayCounter = 1;
        set val = 0;
            
            count_start:
        while (_currEnd < _end) do
          call counter_proc(poi_id, _currEnd, val); -- get the value
                update popular_times set popularity = ceil((val / max) * 100) where popular_times.poi_id = poi_id and popular_times.day = dayCounter and popular_times.hour = hourCounter;
                
                if (hourCounter < 25) then
            set hourCounter = hourCounter + 1;
          else 
                    set hourCounter = 1;
                    set dayCounter = dayCounter + 1;
                end if;
                
                set _currEnd = date_add(_currEnd, interval 1 hour);
        end while count_start;
            
        if finished = 1 then
          leave pois_loop;
        end if;
      end loop pois_loop;
        
        close _cursor;
    END`,
    []
  );

  await connection.query(
    `CREATE PROCEDURE counter_proc(poi_id varchar(27), _currEnd timestamp, out val int)   
    BEGIN
      set val = (select count(*) from visits
      where difference(_currend, visits.visit_timestamp ) = 1
        and visits.poi_id = poi_id);
    END`,
    []
  );

  await connection.commit();
  await connection.end();

  console.log("Created popular times db.");
};

exports.mysql_pop_times_visits_db_Main = mysql_pop_times_visits_db_Main;
