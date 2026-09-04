# Test Cases

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| TC01 | Start mobile app | Open Expo Go project | Controller screen loads |
| TC02 | Enter laptop IP | Enter valid local IP | IP is accepted |
| TC03 | Connect controller | Press Connect | WebSocket connection succeeds |
| TC04 | Invalid IP | Enter invalid IP | Connection error is displayed |
| TC05 | Sensor access | Open controller | Sensor readings are available |
| TC06 | Calibration | Hold phone still and calibrate | Neutral position is recorded |
| TC07 | Detect slash | Move phone quickly | Slash event is generated |
| TC08 | Slow movement | Move phone slowly | Unintentional slash is minimized |
| TC09 | Cut fruit | Slash through fruit | Fruit disappears and score increases |
| TC10 | Hit bomb | Slash through bomb | Penalty is applied |
| TC11 | Combo | Cut several fruits consecutively | Combo increases |
| TC12 | Combo reset | Hit bomb or wait beyond combo window | Combo resets |
| TC13 | Difficulty | Continue playing | Game becomes progressively harder |
| TC14 | Pause | Press pause | Game objects stop |
| TC15 | Resume | Resume game | Gameplay continues |
| TC16 | Game over | Reach time/loss condition | Results screen appears |
| TC17 | Save score | Finish a high-scoring game | Score is saved |
| TC18 | Load scores | Restart game | Saved high scores are available |
| TC19 | Disconnect phone | Close controller app | Game handles disconnect gracefully |
| TC20 | Reconnect | Reopen controller and connect | Controller can reconnect |
| TC21 | Invalid message | Send malformed WebSocket data | Server does not crash |
| TC22 | Sound effects | Cut fruit/hit bomb | Correct sound plays |
| TC23 | Multiple objects | Spawn several objects | Collision detection remains correct |
| TC24 | Long session | Play continuously | Game remains stable |
| TC25 | Browser build | Run `npm run build` | Browser bundle is generated successfully |
| TC26 | Backend starts | Run `python main.py` | Python WebSocket backend listens on port 8765 |
| TC27 | Message relay | Connect two WebSocket clients | A valid JSON message reaches the other client |
| TC28 | Invalid JSON | Send malformed WebSocket data | Sender receives an error without server crash |

## Execution Status

These are target scenarios, not a report of completed execution. The browser
prototype currently provides the practical path for TC09-TC16, TC22, and
parts of TC23-TC24 using mouse or touch input. TC01 is partially available
through the Expo home screen.

TC02-TC08, TC17-TC21, and TC26-TC28 depend on mobile sensors, persistence,
LAN protocol handling, or client integration and are currently
planned, blocked, or not implemented. Add an execution result and environment
to this table when those capabilities are delivered.
