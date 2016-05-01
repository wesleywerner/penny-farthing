# Overview

Lab: Create a card game.
Restrictions: Allowed technologies are: Seb canvas, vanilla JS.
Reasoning: Learn the web canvas API.
Pattern: Attempt to model towards a model-view-controller pattern.

# Terminology

### DECK

A deck contains one or more cards. When you take from a deck, you have two decks.

# Program Flow

+---------+
| DECK.JS |
+-^-------+
  |            +----------------+
  |        +--->  GAME RULES.JS <--+
  |        |   +----------------+  |
  |        |                       |
+-+--------+-+                   +-+-------+
|  MODEL.JS  <-------------------+ VIEW.JS |
+----------+-+                   +-+----+--+
           |                       |    ^
           |   +---------------+   |    |
           +---> CONTROLLER.JS <---+    |
               +-------+-------+        |
                       |                |
                  EVENT|DRIVEN          |
                       |                |
               +-------v-------+        |
               |               +--------+
               |   GAME LOOP   |
               |               |
               +---------------+

DECK.JS provides methods to handle a deck of cards. It can fill a deck with 52 cards, shuffle, take and get cards.
MODEL.JS tracks the game state, it consults GAME RULES whenever an action is performed.
GAME RULES.JS contains game logic that determines how cards are dealt, moved, flipped or taken.
CONTROLLER.JS handles user input and translates it to the methods that changes the model.
VIEW.JS draw the state of the model. It consults GAME RULES when it has to determine the postition of a deck of cards.

# V1
+----------+
|  DECK.JS <----+
+----------+    |
                |
+----------+  +-+----------+                   +---------+
| TABLE.JS <--+  MODEL.JS  <-------------------+ VIEW.JS |
+----------+  +-+--------+-+                   +-+----+--+
                |        |                       |    ^
+----------+    |        |   +---------------+   |    |
| RULES.JS <----+        +---+ CONTROLLER.JS <---+    |
+----------+                 +-------+-------+        |
                                     |                |
                                EVENT|DRIVEN          |
                                     |                |
                             +-------v-------+        |
                             |               +--------+
                             |   GAME LOOP   |
                             |               |
                             +---------------+
