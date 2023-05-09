class MessageController {

    constructor () {
        this.errorTypes = {
            'no_username': "Don't forget your username!",
            'no_room': "Are you sure you filled in the correct room code?",
            'error': 'Something went wrong... not sure what LOL contact our devs!',
            'username_taken': 'Username taken... time to get more creative LOL',
            'no_info': 'Spare room code and username...'
        }
    }

    getErrorMessage = (errorType) => { 
        return this.errorTypes[errorType];
    }
    
}

export default MessageController;