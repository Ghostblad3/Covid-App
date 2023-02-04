# Web application based on microservices architecture

This web application was designed for my thesis. It utilizes a microservices architecture.

## Frameworks and Tools

### Front-end

The front-end is designed using React.js and Material UI. Also popular libraries like Leaflet.js and Chart.js are being used.

### Back-end

The back-end consists of 8 Node.js servers. All the servers use Express.js.

### Storage

Each microservice has its own database. MySQL was used for the microservices that store relational data and MongoDB was used for the microservices that store non relational data. Also Redis which is an in-memory database was used for storing user sessions.

### Event Bus

Nats Streaming Server was used for the event bus of the application.

## Capabilities

The application consists of a client and admin UI.

### Client

The clients can add visit intentions to various Points of Interest (POI) in the town of Patras, Greece. Also, they can declare that they are active cases of coronavirus. They can see their visit history, their declaration case history and all their visits where there was a possible contact with an active coronavirus case.

### Admin

The admin can upload new Points of Interest to the application. In addition, he can see various stats about visits from clients, visits from active cases, total cases etc.

## Screenshots

![](screenshots/1.png)

<p align="center">
Figure 1: The login screen.
</p>
<br/>

![](screenshots/2.png)

<p align="center">
Figure 2: The register screen.
</p>
<br/>

### Admin Capabilities

![](screenshots/3.png)

<p align="center">
Figure 3: The form for uploading new Points of Interest.
</p>
<br/>

![](screenshots/4.png)

<p align="center">
Figure 4: General stats about covid cases, visits by users, visits by active cases, visits by POI category from users and active cases.
</p>
<br/>

![](screenshots/5.png)

<p align="center">
Figure 5: Visits from users for specific month of the current year.
</p>
<br/>

![](screenshots/6.png)

<p align="center">
Figure 6: Visits from active cases for specific month of the current year.
</p>
<br/>

![](screenshots/7.png)

<p align="center">
Figure 7: Visits from users for specific week of the current year.
</p>
<br/>

![](screenshots/8.png)

<p align="center">
Figure 8: Visits from users for specific day of the current year.
</p>
<br/>

![](screenshots/9.png)

<p align="center">
Figure 9: Visits from active cases for specific day of the current year.
</p>
<br/>

### User capabilities

![](screenshots/10.png)

<p align="center">
Figure 10: The map displaying the position of the user.
</p>
<br/>

![](screenshots/11.png)

<p align="center">
Figure 11: Nearby POI displayed in the map.
</p>
<br/>

![](screenshots/12.png)

<p align="center">
Figure 12: The pop-up of the marker of a specific POI displaying its information.
</p>
<br/>

![](screenshots/13.png)

<p align="center">
Figure 13: Declaration of intention to visit a nearby POI.
</p>
<br/>

![](screenshots/14.png)

<p align="center">
Figure 14: Displaying specific POI on the map searched by their name.
</p>
<br/>

![](screenshots/15.png)

<p align="center">
Figure 15: Displaying specific POI on the map searched by their category.
</p>
<br/>

![](screenshots/16.png)

<p align="center">
Figure 16: Displaying all the POI on the map.
</p>
<br/>

![](screenshots/17.png)

<p align="center">
Figure 17: Table that contains all the visits of the user where there was a possible contact with an active coronavirus case.
</p>
<br/>

![](screenshots/18.png)

<p align="center">
Figure 18: Form where the user can declare that he is an active case.
</p>
<br/>

![](screenshots/19.png)

<p align="center">
Figure 19: Table that contains all the visits of the user.
</p>
<br/>

![](screenshots/20.png)

<p align="center">
Figure 20: Table that contains all the declarations of the user as an active case.
</p>
<br/>

![](screenshots/21.png)

<p align="center">
Figure 21: Menu for chaning the credentials of the user.
</p>
<br/>
