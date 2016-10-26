import _ from 'lodash';
import React, { Component } from 'react';
import KeyBinding from 'react-keybinding-component';
import './App.css';

const STIM_SIZE = 50 // px
const GRID_SIZE = 64 // scalar
const VISUAL_ANGLE = 11 // px

const NormalColors = {
  Red: '#FF0000',
  Green: '#06cc06'
}

const OddballColors = [
  'blue',
  'yellow',
  'red',
  'purple',
  'orange',
]

const ISIJitter = () => {
  return _.random(950, 1150)
}

const placementJitter = () => {
  return _.random(-VISUAL_ANGLE, VISUAL_ANGLE)
}

const stimuliToShow = () => _
  .chain(GRID_SIZE)
  .range()
  .shuffle()
  .take(_.random(6, 12))
  .sortBy()
  .value()

class Circle extends Component {
  render() {
    const { isShown, color } = this.props
    const style = {
      height: STIM_SIZE,
      width: STIM_SIZE,
      marginTop: placementJitter(),
      marginLeft: placementJitter(),
      marginBottom: placementJitter(),
      marginRight: placementJitter(),
      opacity: isShown ? 1 : 0,
      backgroundColor: color,
    }
    return <div className="Circle" style={style}/>
  }
}

class Star extends Component {
  render() {
    const { isShown } = this.props
    const style = {
      marginTop: placementJitter(),
      marginLeft: placementJitter(),
      marginBottom: placementJitter(),
      marginRight: placementJitter(),
      fontSize: STIM_SIZE * 1.5,
      opacity: isShown ? 1 : 0,
      color: _.sample(OddballColors),
    }
    return <div className="Star" style={style}/>
  }
}

class Grid extends Component {
  render() {
    const cols = Math.sqrt(GRID_SIZE)
    const stimuli = this.props.stimuli
    return (
      <div className="Grid">
        {
          _.range(cols).map(i => (
            <div className="Grid-column">
            { _.range(cols).map(j => stimuli[i * cols + j]) }
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

class Instructions extends Component {

  render() {
    const { title, body } = this.props
    return (
      <div className="Instructions">
        <div className="Instructions-content">
          <div className="Instructions-title">{title}</div>
          <div className="Instructions-body">{body}</div>
        </div>
      </div>
    )
  }

}

const Mode = {
  Instructions: 0,
  Fixation: 1,
  StandardStimlus: 2,
  OddballStimulus: 3,
}

const NUM_MODES = Object.keys(Mode).length

class App extends KeyBinding {

  constructor(props) {
    super(props)
    this.state = {
      mode: Mode.Instructions,
    }
  }

  onKey(event) {
    if (event.keyCode === 'M'.charCodeAt()) {
      this.setState({mode: (this.state.mode + 1) % NUM_MODES})
      console.log(this.state.mode)
    }
    this.forceUpdate()
  }

  render() {

    return (
      <div className="App">
        <Instructions
          title="Welcome to our experiment."
          body="In this experiment, you will be shown some very distrubing images. Unfortunately, you are not permitted to look away in any circumstance."
        />
      </div>
    )

    if (this.state.mode === Mode.Fixation) {
      return (
        <div className="App">
          <Fixation/>
        </div>
      )
    }

    let stimuli = []
    const toShow = stimuliToShow()
    let stimuliPlaced = 0
    stimuli = _.range(GRID_SIZE).map(() => {
      const isShown = toShow.includes(stimuliPlaced++)
      if (this.state.mode === Mode.StandardStimlus) {
        return <Circle color={NormalColors.Green} isShown={isShown} />
      }
      return <Star isShown={isShown} />
    })

    return (
      <div className="App">
        <Grid onKey={this.onKey} stimuli={stimuli}/>
      </div>
    )
  }
}

export default App
