module.exports = class Event{
    constructor(eventID, name, topic, details, date, time, location, image){
        this._eventID = eventID;
        this._name = name;
        this._topic = topic;
        this._details = details;
        this._date = date;
        this._time = time;
        this._location = location;
        this._image = image;
    }


    get eventID(){ return this._eventID;}
    set eventID(eventID){ this._eventID = eventID;}

    get name(){ return this._name;}
    set name(name){ this._name = name;}

    get topic(){ return this._topic;}
    set topic(topic){ this._topic = topic;}

    get details(){ return this._details;}
    set details(details){ this._details = details;}

    get date(){ return this._date;}
    set date(date){ this._date = date;}

    get time(){ return this._time;}
    set time(time){ this._time = time;}

    get location(){ return this._location;}
    set location(location){ this._location = location;}

    get image(){ return this._image};
    set image(image){ this._image = image;}
}