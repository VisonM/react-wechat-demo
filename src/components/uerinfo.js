import React from 'react'
import axios from 'axios';
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'
import {loadUserInfo} from '../redex/user.redux'
@withRouter
@connect(
    state=>state,
    {loadUserInfo}
)
export default class Userinfo extends React.Component{
    componentDidMount(){
        const publicList=['/login','/register']
        const pathName=this.props.location.pathName
        if(publicList.indexOf(pathName)>-1){
            return null
        }

        if(!this.props.user){
            console.log("______________user undefind__________")
           // Toast.offline('请登录!!!', 0);
            this.props.history.push('/login')
            return
        }
        axios.get('/user/info').then((res)=>{
            if(res.status==200){
                if(res.data.code==0){
                    //已登录
                    this.props.loadUserInfo(res.data.data)
                }else{
                    console.log("______________to login__________")
                    this.props.history.push('/login')
                }
            }
        })
    }

    render(){
        return (
            null
        )
    }
}
