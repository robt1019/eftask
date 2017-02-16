To run:

    Start the server app, running on port 8080

    from inside the client folder type:

    'npm run build'
    'npm run start'

    the chat front end should then be accessable on localhost:8000

Overview
    
    * I've concentrated on functionality rather than appearance. As such the application is very basic looking. 
    However, it should have all the pieces in place to make a nicer looking application, and I think
    I have covered all the user stories specified in the brief.

    * I hadn't worked with WebSockets before so quite a bit of time was spent initially getting 
    familiar with them and working out how to plug them into an Angular framework.

    * Overall I'm quite happy with my work, despite its imperfections and found the task enjoyable.

Architecture

    Most of the code can be found in the components folder. 

    account
        accountService

            * accountService handles all server calls and state related to logging in and out. It keeps a record of 
            the token for the user.
            * State is stored in the browser's session storage so that on reloading the page users don't have to 
            log in again.

        login component

            * This holds the view and controller for the login component and defines a directive for using it in another view
    chat
        chatService

            * This is where all server calls and logic related to processing conversations occurs. 
            It maintains a websocket conection and keeps an array of watchers that are passed in from 
            interested controllers to update them in the case of a websocket event. It keeps a record of 
            all registered users.

            * It also sets up and stores a conversations object which is indexable by conversationId 
            and messageId to make processing the data simpler in the conversations controller and view.

            * This service could defintely be refactored and made clearer given more time.

    homepage component
        
        * This handles logging out via a navbar and houses the login and conversations components

        conversations component
            
            * This holds the view and controller for a user's conversations. It has a number of callback 
            functions registered with the Chatservice to be called in the case of various websocket events, 
            to update the UI, and takes all user inputs related to messaging and sends them to the relevant service for execution.

Testing

    * I haven't written as many tests as i would normally, as I wanted to prioritise getting through the user stories. 
    If I were to start over I'd probably have ensured that tests were completed for each story as they were finished rather 
    than trying to do them all afterwards. The only file that has been tested currently is AccountService.js. 
    Hopefully this gives some indication of how I would test the rest of the application if I had been a bit more disciplined.

    * To run the tests cd into client and type 'npm run test'

Weaknesses
    
    * There are quite a few loops related to setting up conversation and messaging objects based on the server responses 
    for use in the views. I'm sure this process could be optimised. The current setup would likely get quite overloaded with lots of people using it.

    * As mentioned above this isn't tested to a standard I'm happy with and as such I'm sure there are some bugs in the code.

    * The UI could definitely be improved a lot.
    