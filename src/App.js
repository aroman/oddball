import _ from 'lodash';
import React, { Component } from 'react';
import KeyBinding from 'react-keybinding-component';
import './App.css';

const STIM_SIZE = 50 // px
const GRID_SIZE = 64 // scalar
const VISUAL_ANGLE = 11 // px
const NUM_BLOCKS = 8 // 1-indexed because I suck
const NUM_TRIALS_PER_BLOCK = 19 // 0-indexed because I suck

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

const CSV_Headers = [
  'user_id',
  'block_num',
  'trial_num',
  'is_star',
  'actual_num_objects',
  'reported_num_objects',
  'oddball_duration',
  'actual_shorter',
  'reported_shorter',
  'oddball_locs'
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
        <div className="Fixation-dot">+</div>
      </div>
    )
  }
}

class Instructions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      canContinue: false,
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({canContinue: true}), 5000)
  }

  render() {
    const { title, onDone } = this.props
    return (
      <div className="Instructions">
        <div className="Instructions-content">
          <div className="Instructions-title">{title}</div>
          <div className="Instructions-body">{this.props.children}</div>
          <button
            className="Instructions-button"
            disabled={!this.state.canContinue}
            onClick={onDone}>continue
          </button>
        </div>
      </div>
    )
  }
}

class InterBlockScreen extends Component {
  render() {
    const { onDone, blockNum } = this.props
    const blockText = blockNum === 0 ? 'Practice Block' : 'Block ' + blockNum + '/' + NUM_BLOCKS
    const relaxText = blockNum === 0 ? '' : 'If you need to take a short break, please do so now.'

    return (
      <div className="InterBlockScreen">
        <div className="InterBlockScreen-content">{blockText}</div>
        <div className="InterBlockScreen-content2">{relaxText}</div>
        <button
          className="InterBlockScreen-button"
          onClick={onDone}>continue
        </button>
      </div>
    )
  }
}

class EndScreen extends Component {
  render() {
    const csv = [CSV_Headers].concat(this.props.data).map((datum) => datum.join(",")).join("\n")
    const data = "data:text/csv;charset=utf-8," + csv

    const encodedUri = encodeURI(data)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "results_" + this.props.user + ".csv")

    link.click()

    return (
      <div className="EndScreen">
        Thank you. Your results have been recorded. Have a nice day.
      </div>
    )
  }
}

class UserInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      number: null,
      shorter: null,
    }
  }

  componentDidMount() {
    this.numberInput.focus()
  }

  handleSubmit() {
    this.props.onSubmit(this.state)
  }

  render() {
    const hasValidAnswers = this.state.number && (this.state.shorter != null)
    return (
      <div className="UserInput">
        <div className="UserInput-container">
          <div className="UserInput-title">Please answer as accurately as possible.</div>
          <div className="UserInput-group">
            <div className="UserInput-label">How many <strong>non-green</strong> objects did you see?</div>
            <input
              className="UserInput-number"
              type="number"
              min={1}
              max={30}
              onChange={event => this.setState({number: Number(event.target.value)})}
              ref={c => this.numberInput = c}
            />
          </div>
          <div className="UserInput-group">
            <div className="UserInput-label">Were the <strong>non-green</strong> objects displayed for a shorter or longer period of time than the green objects?</div>
            <div className="UserInput-duration">
              <label>
                <input
                  type="radio"
                  name="duration"
                  value="shorter"
                  onChange={() => this.setState({shorter: true})}
                />
                shorter
              </label>
              <label>
                <input
                  type="radio"
                  name="duration"
                  value="longer"
                  onChange={() => this.setState({shorter: false})}
                />
                longer
              </label>
            </div>
          </div>
          <button
            className="UserInput-submit"
            disabled={!hasValidAnswers}
            onClick={this.handleSubmit.bind(this)}>submit
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
  UserInput: 4,
  InterBlockScreen: 5,
  EndScreen: 6,
}

const OddballType = {
  Star: 0,
  Circle: 1,
}

const getOddballType = () => _.sample(OddballType)

class App extends KeyBinding {
  constructor(props) {
    super(props)
    const numScreens = getNumScreens()
    this.state = {
      data: [],
      user: 217,
      mode: Mode.Instructions,
      block: 0,
      trial: 0,
      screenNum: -1,
      numScreens: numScreens,
      standard: stimuliToShow(),
      oddball: stimuliToShow(),
      oddballScreenNum: getOddballScreenNum(numScreens),
      oddballDuration: getOddballDuration(),
      oddballType: getOddballType(),
    }
  }

  advanceMode() {
    const mode = (() => {
      switch (this.state.mode) {
        case Mode.Instructions:
          return Mode.InterBlockScreen
        case Mode.InterBlockScreen:
          return Mode.Fixation
        case Mode.StandardStimlus:
        case Mode.OddballStimulus:
          return this.state.screenNum === this.state.numScreens ? Mode.UserInput : Mode.Fixation
        case Mode.Fixation:
          return this.state.screenNum === this.state.oddballScreenNum ? Mode.OddballStimulus : Mode.StandardStimlus
        default:
          throw Error("You shouldn't be here (advanceMode).")
      }
    })()

    const screenNum = mode === Mode.Fixation ? this.state.screenNum + 1 : this.state.screenNum

    if (mode !== Mode.UserInput && mode !== Mode.InterBlockScreen) {
      setTimeout(() => this.advanceMode(), this.delay(mode))
    }
    this.setState({mode, screenNum})
  }

  advanceTrial() {
    const numScreens = getNumScreens()
    const newState = {
      numScreens: numScreens,
      standard: stimuliToShow(),
      oddballScreenNum: getOddballScreenNum(numScreens),
      oddballDuration: getOddballDuration(),
      oddballType: getOddballType(),
    }

    if(this.state.trial < NUM_TRIALS_PER_BLOCK) {
      newState.trial = this.state.trial + 1
      newState.screenNum = 0
      newState.mode = Mode.Fixation
      setTimeout(() => this.advanceMode(), this.delay(Mode.Fixation))
    } else if(this.state.block < NUM_BLOCKS) {
      newState.trial = 0
      newState.screenNum = -1
      newState.block = this.state.block + 1
      newState.mode = Mode.InterBlockScreen
    } else {
      newState.mode = Mode.EndScreen
    }

    this.setState(newState)
  }

  delay(mode) {
    switch (mode) {
      case Mode.Fixation:
        return ISIJitter()
      case Mode.StandardStimlus:
        return 1050;
      case Mode.OddballStimulus:
        return this.state.oddballDuration
      default:
        throw Error("You shouldn't be here (delay).")
    }
  }

  recordTrialData(data) {
    const { user, trial, block, oddballType, oddballDuration, oddball, standard } = this.state
    const { shorter, number } = data
    const newDatum = [
      user,                                          // User ID
      block,                                         // Block #
      trial,                                         // Trial #
      +(oddballType === OddballType.Star),           // Is supa fancy oddball
      oddball.length,                                // Actual num objects
      number,                                        // Reported num objects
      oddballDuration,                               // Oddball duration
      +(oddballDuration < 1050),                     // Actual shorter
      +shorter,                                      // Reported shorter
      standard.join(':'),                            // Indexes of standard
      oddball.join(':'),                             // Indexes of oddball
    ]

    this.setState({data: this.state.data.concat([newDatum])})
  }

  render() {
    if (this.state.mode === Mode.Instructions) {
      return (
        <div className="App">
          <Instructions
            onDone={() => this.advanceMode()}
            title="Please read these instructions carefully."
          >
            <p>
              In this experiment, you will be shown screens displaying <strong>green objects</strong> and screens displaying various <strong>non-green objects</strong>.
            </p>
            <p>
              After viewing these screens, you will answer two questions:
            </p>
            <ol>
              <li>
                <strong>How many</strong> non-green objects did you see?
              </li>
              <li>
                Were the non-green objects displayed for a <strong>shorter</strong> or <strong>longer</strong> period of time than the green objects?
              </li>
            </ol>
            <p>
              First, you will complete a practice block consisting of 20 trials. Then, you will complete 8 blocks consisting of 20 trials.
            </p>
            <p>
              If you understand these instructions, please press <strong>continue</strong>.
              Otherwise, please <strong>ask for help</strong>.
            </p>
          </Instructions>
        </div>
      )
    }

    if (this.state.mode === Mode.Fixation) {
      return (
        <div className="App">
          <Fixation/>
        </div>
      )
    }

    if (this.state.mode === Mode.UserInput) {
      return (
        <div className="App">
          <UserInput onSubmit={data => { this.recordTrialData(data); this.advanceTrial() }}/>
        </div>
      )
    }

    if (this.state.mode === Mode.EndScreen) {
      return (
        <div className="App">
          <EndScreen data={this.state.data} user={this.state.user}/>
        </div>
      )
    }

    if (this.state.mode === Mode.InterBlockScreen) {
      return (
        <div className="App">
          <InterBlockScreen onDone={() => this.advanceMode()} blockNum={this.state.block}/>
        </div>
      )
    }

    let stimuli = []
    const toShow = this.state.mode === Mode.StandardStimlus ? this.state.standard : this.state.oddball
    let stimuliPlaced = 0
    stimuli = _.range(GRID_SIZE).map(() => {
      const isShown = toShow.includes(stimuliPlaced++)
      if (this.state.mode === Mode.StandardStimlus) {
        return <Circle color={NormalColors.Green} isShown={isShown} />
      } else if (this.state.mode === Mode.OddballStimulus && this.state.oddballType === OddballType.Star) {
        return <Star isShown={isShown} />
      } else if (this.state.mode === Mode.OddballStimulus && this.state.oddballType === OddballType.Circle) {
        return <Circle color={NormalColors.Red} isShown={isShown} />
      } else {
        throw Error("You shouldn't be here (render)")
      }
    })

    return (
      <div className="App">
        <Grid onKey={this.onKey} stimuli={stimuli}/>
      </div>
    )
  }
}

export default App
