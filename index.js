'use strict';
const async = require('async');
const mqtt = require('mqtt');
const ms = require('ms');




const Nmap = require('./lib/Collectors/Nmap');
const CollectorRunner = require('./lib/CollectorRunner');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./mac_registrations.json');
const db = low(adapter);

const config = require('./config/default.js');

const mqttClient = mqtt.connect('mqtt://' + config.mqtt.hostname);

const collector = new CollectorRunner();



//------ SETUP ------//
collector.add(new Nmap(config.nmap));

db.defaults({mac_list:[]}).write();



let users_in_the_hood = [];

setInterval(() => {
    collector.update(function (err, _res) {
        if (err) {
            console.log(err);
        }
        console.log(_res);
        //To UPPER
        //REMOVE SPACES
        users_in_the_hood = [];
        for (let index = 0; index < _res.length; index++) {
            const element = _res[index];

            var db_res = db.get('mac_list').find({ mac: String(element.mac).toUpperCase() }).value();
            if (!db_res) {
                console.log("mac_not_found" + String(element.mac).toUpperCase() + " in database");
                continue;
            }
            console.log("FOUND " + String(element.mac).toUpperCase() + " in database");
            users_in_the_hood.push(db_res);
        }
        console.log("---- SCAN RESULT ---");
        console.log(users_in_the_hood);

        if (users_in_the_hood) {
            mqttClient.publish(config.mqtt.topics.spaceStatus,  JSON.stringify({ count: users_in_the_hood.length, hosts: users_in_the_hood }), config.mqtt.options);
        } else {
            mqttClient.publish(config.mqtt.topics.spaceStatus, JSON.stringify({ count: users_in_the_hood.length, hosts: users_in_the_hood }), config.mqtt.options);
        }
        mqttClient.publish(config.mqtt.topics.spaceStaffCount, ''+ String(users_in_the_hood.length), config.mqtt.options);
        
    });
}, 5000*60);

