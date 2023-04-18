# BR: Rock-Paper-Scissors - Documentation

For the course "Real-Time Web" everyone was tasked to design and build a Real-Time web application (obiously) based on your own concept. The teachers gave us about three weeks for this assignment. 

## Brainstorming

About a week before the course actually started I went ahead and looked into what would be expected of me during this course. I read the different assignments and noticed we would be spending time creating a real-time web application based on one of our own personal concepts.

I was quick to think of two ideas that could be ambitious if put in some extra effort but also managable within a span of three weeks:

- Multiplayer typeracer (something like [monkeytype](https://monkeytype.com/))
- Multiplayer/Battle Royale rock, paper, scissors

I am a big fan of custom keyboards, and therefore automatically love doing little speed typing tests with friends. There are sites out there like [monkeytype](https://monkeytype.com/) or [typeracer](https://typeracer.com/), but I felt like it would be fun to create my own app for it which also included some form of a chat room. This could have been a fun project, but I think I would have gotten sucked into the technical aspect of the game itself rather than the real focus of this course.

Therefore, the rock, paper scissors game sounded a bit more managable, and it would be something I can always expand on by adding extra features (basically, the main difference between the two ideas is that the typeracer has a bigger/more difficult core functionality compared to the RPS game). Not only am I a big fan of custom keyboards, I am also a fan of movies! As any other movie enjoyer, I liked The Hunger Games a lot. You could say it is basically a Battle Royale movie. You enter an arena and fight for survival; last one standing wins. This is the type of energy I wanted to go for with my rock, paper, scissors game. 

## Concept

Like I said, enter an arena and fight for survival. That's the main goal of this game: win a round of rock, paper, scissors! Except, instead of playing 1-on-1, you're playing against 5 other people at the same time, virtually.

The idea is fairly simple. Just like in The Hunger Games, there is a Game Master. The Game Master (at first) is the player who created the room. After room creation, they can then share the room key with others. Upon entering the game room, users can chat with each other in real-time thanks to the socket connection.

To start the first game session, The Game Master will have to select up to five other players to play with and against (may the odds be ever in your favor!). During the first round, each player will receive one of the following power-up:

- A gun: beats paper and scissors and loses to rock
- A shield: blocks any life-threatening attack (for example: if you picked paper and your opponent rock, the shield will keep you alive for another round)
- Reverse: switch your selected choice with that of your opponent (would only work in 1v1)
- Revival: bring an eliminated player back to life

The last player standing wins the first session and automatically makes them the new Game Master. The game and this cycle basically continues until a player gets crowned as Apex Predator (wink Apex Legends inspo) by reaching 3 total wins.

## Features

Based on the concept brief above, I was able to create a list of must-have requirements:

- User must be able to create a game room
- User must be able to share a room key
- User must be able to enter a game room via room key
- User must be able to pick a username
- User must be able to chat with other players
- System must be able to assign random avatar icons for each new user
- Admin user (game master) must be able to select a group of players to start the game
- User must be able to play rock, paper, scissors

Some additional requirements that I could think of with less priority than the requirements above:

- System provides power-up to users during certain rounds
- Users must be able to equip power-ups
- Admin must be able to end the entire session for everyone
- Admin must be able to restart the session for everyone