# Zombie Game

Simple zombie game created for Intruduction to Web Applications course

### Technologies used:
* HTML
* CSS
* JavaScript

### Game rules

- The basic shooting mechanism for zombies is shooting with the mouse (left click),
- Zombies appear from the right side of the screen and move towards the left,
- Zombies can appear at different heights on the screen,
- Zombie appearances are generated randomly,
- The speed of movement is also randomly generated within certain ranges, e.g. 1 - 5, where 1 is the standard speed and 5 is turbo mode,
- The size of the zombie is also random,
- Each downed zombie is worth 12 points displayed on the screen in online mode,
- The game ends when three zombies reach the end of the screen,
- Static scoring - points are counted for each zombie (as above), for an unsuccessful shot minus points (-6 points),

### Highscores

- At the beginning of the game the game asks for a nickname, then this nickname is displayed over the game board,
- After the game is finished, we retrieve the scores saved on the server,
- We add our score, sort, cut off the first 7 scores and save them back to the server,
- The ranking includes position, nickname, score and date of entry,
- There is a button to return to the new game,


https://user-images.githubusercontent.com/101901301/213884909-1f5650c8-91d5-4e9d-81fe-8038f327c3b6.mp4


To run server:

```
npm install
```

```
npm run start
```
