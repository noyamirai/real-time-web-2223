import fs from 'fs';

class RoomController {

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

    listRoomUsers = (roomObject) => {
        const usernamesInRoom = Object.keys(roomObject).map(key => {
            return roomObject[key].username
        });   

        return usernamesInRoom;
    }
}

export default RoomController;