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

const getNumScreens = () => _.random(4, 14)

const getOddballScreenNum = (numScreens) => _.random(4, numScreens)

const getOddballDuration = () => _.sample([750, 900, 1200, 1350])


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
    const { title, body, onDone } = this.props
    return (
      <div className="Instructions">
        <div className="Instructions-content">
          <div className="Instructions-title">{title}</div>
          <div className="Instructions-body">{body}</div>
          <button className="Instructions-button" onClick={onDone}>
            continue
          </button>
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

class App extends KeyBinding {
  constructor(props) {
    super(props)
    const numScreens = getNumScreens()
    this.state = {
      mode: Mode.Instructions,
      trial: 0,
      screenNum: 0,
      numScreens: numScreens,
      standard: stimuliToShow(),
      oddballScreenNum: getOddballScreenNum(numScreens),
      oddballDuration: getOddballDuration(),
    }
  }

  advanceMode() {
    const mode = (() => {
      switch (this.state.mode) {
        case Mode.StandardStimlus:
        case Mode.OddballStimulus:
          return Mode.Fixation
        case Mode.Fixation:
          return this.state.screenNum === this.state.oddballScreenNum ? Mode.OddballStimulus : Mode.StandardStimlus
        default:
          throw Error("You shouldn't be here.")
      }
    })()

    const screenNum = mode === Mode.Fixation ? this.state.screenNum + 1 : this.state.screenNum

    this.setState({mode, screenNum})
    setTimeout(() => this.advanceMode(), this.delay())
  }

  delay() {
    switch (this.state.mode) {
      case Mode.Fixation:
        return ISIJitter()
      case Mode.StandardStimlus:
        return 1050;
      case Mode.OddballStimulus:
        return this.state.oddballDuration
      default:
        throw Error("You shouldn't be here.")
    }
  }

  render() {
    if (this.state.mode === Mode.Instructions)
      return (
        <div className="App">
          <Instructions
            onDone={() => this.setState({mode: Mode.StandardStimlus})}
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
    const toShow = this.state.standard ? this.state.mode === Mode.StandardStimlus : stimuliToShow()
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
