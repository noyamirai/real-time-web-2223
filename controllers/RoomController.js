import fs from 'fs';

class RoomController {

    constructor() {
        this.isConnected = true;
        this.roomObject = {};

    }

    getRoomCode = () => {
        const roomCode = this.generateRoomCode();        
        return roomCode;
    }

    generateRoomCode() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';

        let code = '';

        // Generate first four characters randomly
        for (let i = 0; i < 3; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }

        // Generate last four digits randomly
        for (let i = 0; i < 4; i++) {
            code += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }

        if (!this.doesRoomCodeExist(code)) {
            const codeFile = JSON.parse(fs.readFileSync('./src/rooms.json'));

            const currentRooms = codeFile.rooms;
            currentRooms.push(code);

            fs.writeFile('./src/rooms.json', JSON.stringify({ rooms: currentRooms }), (err) => {
                if (err) throw err;
                console.log('New room codes added to file!');
            });

            return code;
        }

        this.generateRoomCode();
    }

    doesRoomCodeExist = (code) => {
        // Check if code exists
        const codeFile = JSON.parse(fs.readFileSync('./src/rooms.json'));

        if (codeFile.rooms.includes(code)) {
            return true;
        }

        return false;
    }

    deleteRoomFromJson = (code) => {
        const codeFile = JSON.parse(fs.readFileSync('./src/rooms.json'));

        const currentRooms = codeFile.rooms;

        let index = currentRooms.indexOf(code);

        if (index !== -1) {
            currentRooms.splice(index, 1);
        }

        fs.writeFile('./src/rooms.json', JSON.stringify({ rooms: currentRooms }), (err) => {
            if (err) throw err;
            console.log('Room code deleted from file!');
        });

    }

    listRoomUsers = (roomObject) => {
        const usernamesInRoom = Object.keys(roomObject).map(key => {
            return roomObject[key].username
        });   

        return usernamesInRoom;
    }

    getAdmin = (allUsers) => {
        const adminKey = Object.keys(allUsers).filter(key => allUsers[key].is_admin);
        return allUsers[adminKey];
    }

    setConnectionState = (bool) => {
        this.isConnected = bool;
    };

    getConnectionState = () => {
        return this.isConnected;
    }

    roomUsersBackup = (roomObject) => {
        this.roomObject = roomObject;
    }

    getRoomUsersBackup = () => {
        return this.roomObject;
    }

    wasAdminBefore = (username) => {

        if (Object.keys(this.roomObject).length > 0) {
            return this.roomObject[username].is_admin;
        }

        return false;

    }

    getUserFromBackup = (username) => {
        return this.roomObject[username];
    }
}

export default RoomController;