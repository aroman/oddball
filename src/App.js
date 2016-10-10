import _ from 'underscore';
import React, { Component } from 'react';
import KeyBinding from 'react-keybinding-component';
import './App.css';
import './Ball.css';

const BALL_SIZE = 50 // px
const GRID_SIZE = 64 // scalar

const Colors = {
  Red: '#FF0000',
  Green: '#06cc06'
}

let defaultColor = Colors.Red

class Ball extends Component {
  render() {
    const {size, isShown, color} = this.props
    const style = {
      height: size,
      width: size,
      opacity: isShown ? 1 : 0,
      backgroundColor: this.props.color,
    }
    return (
      <div className="Ball" style={style}/>
    )
  }
}

const ballsToShow = () => _
  .chain(GRID_SIZE)
  .range()
  .shuffle()
  .first(_.random(6, 12))
  .sortBy(_.identity)
  .value()

class BallPit extends Component {

  render() {
    const balls = ballsToShow()
    const rows = Math.sqrt(GRID_SIZE)
    const cols = rows
    let ballsPlaced = 0
    console.log(balls)
    return (
      <div className="BallPit">
        {
          _.range(cols).map(i => (
            <div className="BallPit-column">
              {
                _.range(rows).map(() => (
                  <Ball
                    color={defaultColor}
                    isShown={balls.includes(ballsPlaced++)}
                    size={BALL_SIZE}
                  />
                ))
              }
            </div>
          ))
        }
      </div>
    )
  }
}

class Fixation extends Component {
  render() {
    return (
      <div className="Fixation">
        <div className="Fixation-dot">&times;</div>
      </div>
    )
  }
}

const Mode = {
  Fixation: 1,
  Balls: 2,
}

class App extends KeyBinding {

  constructor(props) {
    super(props)
    this.state = {
      mode: Mode.Balls,
    }
  }

  onKey(event) {
    if (event.keyCode === 'R'.charCodeAt()) {
      this.setState({mode: Mode.Balls})
      this.forceUpdate()
    }
    if (event.keyCode === 'C'.charCodeAt()) {
      defaultColor = defaultColor == Colors.Green ? Colors.Red : Colors.Green
      this.setState({mode: Mode.Balls})
      this.forceUpdate()
    }
    if (event.keyCode === 'F'.charCodeAt()) {
      this.setState({mode: Mode.Fixation})
    }
  }

  render() {
    const width = window.innerWidth - BALL_SIZE;
    const height = window.innerHeight - BALL_SIZE;
    return (
      <div className="App">
        {
          this.state.mode === Mode.Balls
          ? <BallPit onKey={this.onKey}/>
          : <Fixation/>
        }
      </div>
    );
  }
}

export default App;
