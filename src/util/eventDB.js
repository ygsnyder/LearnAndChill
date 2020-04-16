const Event = require('../models/eventModel');

const events = [
    new Event(1, 'Backyard brewing with Tim', 'Foodies', 'have fun making bbq', 'Feb 23','12:00','1827 Newark Rd', 'backyardbrewing.jpg'),
    new Event(2, 'Making Sasuage patties', 'Foodies', 'early brunch', 'Feb 19','12:11','3333 Newark Rd', 'brunch.jpg'),
    new Event(3, 'Fine Desserts', 'Foodies', 'have fun making dessert', 'Feb 23','12:00','1827 Newark Rd', 'dessert.jpg'),
    new Event(4, 'Stained Glass', 'DIY', 'make authentic stained glass', 'Feb 27','12:00','1827 Newark Rd', 'stainedglass.jpg'),
    new Event(5, 'Glass Bottle Lamps', 'DIY', 'light up your room with these glass lamps', 'Feb 23','12:00','1827 Newark Rd', 'lamps.PNG'),
    new Event(6, 'Small Crafts', 'DIY', 'any and all mini crafts', 'Feb 23','12:00','1827 Newark Rd','smallcrafts.jpg'),
]

const users = [];

/* Retrieves events from the database */
function getConnections(){
    return events;
}

function getConnection(id){
    var requestedEvent;
    for(let i=0; i<events.length; i++){
        if(events[i]._eventID == id){
            requestedEvent = events[i];
            break;
        }
    }
    return requestedEvent;
}

function addUser(sessionId){
    this.users.push(sessionId)
}

module.exports = {
    getConnections: getConnections,
    getConnection: getConnection
}