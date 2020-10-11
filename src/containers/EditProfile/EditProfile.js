import React from 'react';
import './EditProfile.css';
import {connect } from 'react-redux';
import axios,{put} from 'axios';
import Spinner from '../../components/UI/Spinner/Spinner';
class EditProfile extends React.Component{
    state = {
        username:"",
        previousUserName:"",
        usernameError:false,
        email:"",
        image:null,
        loading:true,
        saving:false,
        previewImg:null,
    }



    componentDidMount(){
        const {token} = this.props;
        const config = {
            headers:{Authorization:`token ${token}`}
        }
        const profileUrl = 'https://instaclone.pythonanywhere.com/api/profile';
        axios.get(profileUrl,config)
        .then(response => {
            const profile = response.data;
            this.setState({
                username:profile.username,
                previousUserName:profile.username,
                email:profile.email,
                loading:false
            });
        })
        .catch(error => {

        })
    }

    handleOnSubmit = event => {
        event.preventDefault();
        const {username,previousUserName, email,image} = this.state;
        const url = 'https://instaclone.pythonanywhere.com/api/check_username/'+username;
        let success = false;
        this.setState({saving:true});
        const {token} = this.props;
        const config = {
            headers: {
                Authorization:`token ${token}`
            }
        }
        if(username == previousUserName){
            this.update(username,email,image)
                .then(response => {
                    this.setState({saving:false});
                })
                .catch(error => {
                });
        } else {
            axios.get(url,config)
            .then(response =>{
            success = response.data.success;
            if(success){
                this.setState({usernameError:false});
                this.update(username,email,image)
                .then(response => {
                    this.setState({saving:false});
                })
                .catch(error => {
                });
            } else{
                this.setState({usernameError:true,saving:false})
            }

            })
            .catch(error => {
            });
            
        }
    }

    update(username,email, image){
        const{token, userId} = this.props;
        const profileEditUrl = `https://instaclone.pythonanywhere.com/api/auth/accounts/${userId}/edit/`;
        const formData = new FormData();
        formData.append('username',username);
        formData.append('email',email);
        if(image) {
            formData.append('image',image);
        }
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                Authorization:`token ${token}`
            }
        }
        return put(profileEditUrl, formData,config);
    }

    handleOnInputChange = (event, type) => {
        event.preventDefault();
        switch(type){
            case 'file':    
                this.setState({image:event.target.files[0], previewImg: URL.createObjectURL(event.target.files[0])})
                break;
            case 'username':
                this.setState({username:event.target.value});
                break;
            case 'email':
                this.setState({email:event.target.value})
                break;
        }
    }

    render(){
        let form = <Spinner/>;
        const {loading} = this.state;
        if(!loading) {
            const {username,email} = this.state;
            form = <form onSubmit = {this.handleOnSubmit}>
                        <div className='form-group'>
                            <label htmlFor='editProfileimg'>Change Profile Pic</label><br/>
                            <input
                            id='editProfileimg'
                            className='form-control-file'
                            type='file' onChange = {(event) => this.handleOnInputChange(event,'file')} /> 

                            { this.state.previewImg ?<div>
                                <img src={this.state.previewImg} className='img-rounded-sm m-2' /> 
                                <b>Preview of the new profile picture.</b>
                                </div>:''}
                        </div>
                        <div className='form-group'>
                            <label htmlFor='usernameInput'>Username</label>
                            <input id='usernameInput'
                                className='form-control'
                                value={username} 
                                type='text' onChange = {(event) => this.handleOnInputChange(event,'username')} /> 
                        </div>
                        {this.state.usernameError?
                         <p className='alert alert-danger'>This username already exists</p>
                          : '' 
                        }
                        <div className='form-group'>
                            <label htmlFor='userEmailInput'>Email</label>
                            <input type='email'
                            className='form-control'
                            id='userEmailInput'
                            value={email} onChange = {(event) => this.handleOnInputChange(event,'email')} /><br/>
                        </div>
                        
                        <button className='btn btn-success' type='submit'>
                        {this.state.saving ?  'Saving... '
                        :'Save '
                        }
                        <i className='fas fa-save'></i>
                        </button>
                    </form>
        }
        return(
            <div className='col card p-3'>
                <h2>Edit Profile</h2>
                {form}
            </div>
        );
    }
}
const mapStateToProps = state => {
    return {
        token:state.auth.token,
        userId:state.auth.userId
    }
}
export default connect(mapStateToProps)(EditProfile);