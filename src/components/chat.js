import React from "react"
import io from "socket.io-client"
import { List, InputItem, Button, NavBar, Icon, Grid, Toast, Popover, Checkbox } from "antd-mobile"
import { connect } from "react-redux"
import { loadUserInfo } from "./../redex/user.redux"
import { getMsgList, sendMsg, getMsg, readMsg } from "./../redex/chat.redux"
const CheckboxItem = Checkbox.CheckboxItem
const socket = io("ws://127.0.0.1:8081")
@connect(
  state => state,
  { getMsgList, sendMsg, getMsg, readMsg, loadUserInfo },
)
export default class Chat extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: "",
      msg: [],
      showOptions: [
        { key: 0, label: "显示发送日期", checked: false },
      ],
      popoverVisible:false,
      showEmoji:false
    }
    this.myRef = React.createRef()
  }

  componentWillMount () {
    if (!this.props.chat.chatMsg.length) {
      this.props.getMsgList()
    }
  }

  componentDidMount () {
    if (!this.props.chat.chatMsg.length) {
      this.props.getMsg()

    }

    setTimeout(() => {
      window.dispatchEvent(new Event("resize"))
    }, 0)

    setTimeout(() => {
      if (this.myRef && this.myRef.current) {
        window.scrollTo(0, this.myRef.current.clientHeight)
      }
    }, 1000)
  }

  componentDidUpdate () {

    setTimeout(() => {
      if (this.myRef.current) {
        window.scrollTo(0, this.myRef.current.clientHeight)
      }
    }, 1000)

  }

  componentWillUnmount () {
    const to = this.props.match.params.userName
    this.props.readMsg(to)
  }

  optionsChange = (key) => {
    this.state.showOptions[key].checked = !this.state.showOptions[key].checked
    this.setState({
      showOptions: this.state.showOptions,
    })
  }
  onSelect = () => {
    this.setState({
      popoverVisible: false,
    })
  }

  handleSubmit () {

    const from = this.props.user._id
    const to = this.props.match.params.userName
    const msg = this.state.text
    this.props.sendMsg({ from, to, msg })
    this.setState({
      text: "",
      showEmoji: false,
    })

  }

  render () {
    const emoji = "😁 😂 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 😜 😝 😒 😓 😔 😰 😱 😳 😵 😡 😠 😲 😷 😖 😞 🍇 🍈 🍉 🍊 🍌 🍎 🍏 🍑 🍒 🍓 🍅 🍆 🌽 🍄 🌰 🍞 🍖 🍗 🍔 🍟 🍕 🍳 🍲 🍱 🍘 🍙 🍚 🍛 🍜 🍝 🍠 🍢 🍣 🍤 🍥 🍡 🍦 🍧 🍨 🍩 🍪 🎂 🍰 🍫 🍬 🍭 🍮 🍯 ☕ 🍵 🍶 🍷 🍸 🍹 🍺 🍻 🍴".split(" ").filter(v => v).map(v => ({ text: v }))
    const me = this.props.match.params.userName
    const userInfo = this.props.chat.userInfo
    if (!me || !(userInfo[me] && userInfo[me].name)) {
      return false
    }
    const currentChatId = [me, this.props.user._id].sort().join("_")
    const filterChatMsg = this.props.chat.chatMsg.filter(v => v.chatId == currentChatId)

    const formatTimeStamp=(timeStamp)=>{
      return new Date(timeStamp).toLocaleDateString()+" "+new Date(timeStamp).toLocaleTimeString()
    }

    return (
      <div id="chat-page">
        <NavBar
          mode="dark"
          icon={<Icon type="left" />}
          className="fixed-header"
          onLeftClick={() => {this.props.history.goBack()}}
          rightContent={
            <Popover mask
                     overlayClassName="fortest"
                     overlayStyle={{ color: "currentColor", position: "fixed" }}
                     visible={this.state.popoverVisible}
                     overlay={[
                       ...this.state.showOptions.map(item => {
                         return (
                           <CheckboxItem key={item.key} checked={item.checked}
                                         onChange={() => this.optionsChange(item.key)}>
                             {item.label}
                           </CheckboxItem>
                         )
                       }),
                     ]}
                     align={{
                       overflow: { adjustY: 0, adjustX: 0 },
                       offset: [-10, 0],
                     }}
                     onSelect={this.onSelect}
            >
              <div style={{
                height: "100%",
                padding: "0 15px",
                marginRight: "-15px",
                display: "flex",
                alignItems: "center",
              }}
              >
                <Icon type="ellipsis" />
              </div>
            </Popover>
          }
        >{userInfo[me].name}</NavBar>
        <div style={{ marginBottom: 45, marginTop: 45 }} ref={this.myRef}>
          {
            filterChatMsg.sort((a, b) => a.create_time - b.create_time).map(v => {
              return v.from == me ? (
                <div className="chat-container" key={v.create_time}>
                  <div className="chat-main">
                    <div className="chat-avatar">
                      <img src={userInfo[v.from].avatar||"http://pqgrbj9dn.bkt.clouddn.com/robot.png"} />
                    </div>
                    <div className="chat-content main-other">
                      <div className="message-content triangle-left bg-other">
                        <span className="text-df">{v.content}</span>
                      </div>
                    </div>
                  </div>
                  {
                    this.state.showOptions[0].checked &&
                    <div className="chat-date text-xs">{formatTimeStamp(v.create_time)}</div>
                  }
                </div>
              ) : (
                <div className="chat-container chat-self" key={v.create_time}>
                  <div className="chat-main">
                    <div className="chat-content main-self">
                      <div className="message-content triangle-right bg-self">
                        <span className="text-df">{v.content}</span>
                      </div>
                    </div>
                    <div className="chat-avatar">
                      <img src={userInfo[v.from].avatar||"http://pqgrbj9dn.bkt.clouddn.com/default.png"} />
                    </div>
                  </div>
                  {
                    this.state.showOptions[0].checked &&
                    <div className="chat-date text-xs">{formatTimeStamp(v.create_time)}</div>
                  }
                </div>
              )
            })
          }
        </div>
        <div className="stick-footer">
          <List>
            <InputItem
              placeholder=''
              value={this.state.text}
              onChange={v => {
                this.setState({
                  text: v,
                })
              }}
              onKeyPress={(e) => {
                if (e.charCode === 13) {
                  this.handleSubmit()
                }
              }}
              onFocus={() => {
                this.setState({
                  showEmoji: false,
                })
              }}
              onVirtualKeyboardConfirm={() => this.handleSubmit()}
              extra={
                <div className='emoji'>
                                    <span style={{ marginRight: 10, fontSize: 20 }}
                                          onClick={() => {
                                            this.setState({
                                              showEmoji: !this.state.showEmoji,
                                            })
                                            setTimeout(() => {
                                              window.dispatchEvent(new Event("resize"))
                                            }, 0)
                                          }}
                                    >
                                        😊
                                    </span>
                  {this.state.text == "" ? <Button disabled type="primary">发送</Button> : <Button
                    onClick={() => this.handleSubmit()} type="primary">发送</Button>}
                </div>
              }
            >
            </InputItem>
          </List>
          {
            this.state.showEmoji ?
              <Grid
                data={emoji}
                columnNum={9}
                carouselMaxRow={4}
                isCarousel={true}
                onClick={(el) => {
                  this.setState({
                    text: this.state.text + el.text,
                  })
                }}
              />
              : null
          }
        </div>
      </div>
    )
  }
}
