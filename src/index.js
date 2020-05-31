import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

const app = document.getElementById('app')
const API = 'https://acme-users-api-rev.herokuapp.com/api';

class Companies extends Component{
    render(){
        const {companies, following, id, add} = this.props
        companies.forEach(company => {
            for (let i = 0; i < following.length; i++){
                if(company.id === following[i].companyId){
                    company.rating = following[i].rating
                    company.followingId = following[i].id
                }
            }
        })
        const companyList = companies.map((company,idx) => {
            return(
            <div key ={idx} className = {company.rating ? 'selected' : ''}>
            <h4>{company.name}</h4>
            <div>
            <select className ={'selectBar'} value = {company.rating ? company.rating: ''} onChange = {e => {
                return add(e.target.value, company, id, company.followingId)
            }}>
                <option></option>
                {[1,2,3,4,5].map((num,idx)=> {
            return (
            <option key = {idx} value = {num}>{num}</option>
            )
        })}
            <option>remove</option>
            </select>
            </div>
            </div>
            )
        })
        return (
            <div>
                {companyList}
            </div>
        )
    }
}

class App extends Component{
    constructor(){
        super()
    this.state = {
        companies:[],
        id:[],
        user:[],
        following:[],
        loading:true
    }
    this.add = this.add.bind(this)
}
    componentDidMount(){
        const fetchUser = async ()=> {
          const storage = window.localStorage;
          const userId = storage.getItem('userId'); 
          if(userId){
            try {
              return (await axios.get(`${API}/users/detail/${userId}`)).data;
            }
            catch(ex){
              storage.removeItem('userId');
              return fetchUser();
            }
          }
          const user = (await axios.get(`${API}/users/random`)).data;
          storage.setItem('userId', user.id);
          return  user;
        };
        const id = window.localStorage.userId
        Promise.all([axios.get(`${API}/companies`), axios.get(`${API}/users/detail/${id}`), axios.get(`${API}/users/${id}/followingCompanies`)])
        .then(([companies, user, following]) => {
            this.setState({
                companies:companies.data,
                id:id,
                user: user.data,
                following: following.data,
                loading:false
            })
        })
    }
    add = (value, company, id, followId) => {
        const updateItem = () => axios.put(`${API}/users/${id}/followingCompanies/${followId}`, {rating: value })
        const deleteItem = () => axios.delete(`${API}/users/${id}/followingCompanies/${this.state.following[0].id}`)
        const addItem =  () => axios.post(`${API}/users/${id}/followingCompanies`,{ 
            rating: value,
            companyId: company.id,})
        const getFollowing = () => axios.get(`${API}/users/${id}/followingCompanies`)
        const getCompanies = () => axios.get(`${API}/companies`)
        if (followId) { 
            updateItem()
            .then(()=> {
                return Promise.all([getFollowing(), getCompanies()])
            }).then(([following, companies]) => {
                this.setState({
                    companies: companies.data,
                    following: following.data
                })
            }) 
        }
        else {
            if (this.state.following.length === 5){
            axios.delete(`${API}/users/${id}/followingCompanies/${this.state.following[0].id}`)
            .then(() => axios.post(`${API}/users/${id}/followingCompanies`,{ 
                rating: value,
                companyId: company.id,}))
            .then(() => axios.get(`${API}/users/${id}/followingCompanies`))
            .then(()=> {
                return Promise.all([getFollowing(), getCompanies()])
            }).then(([following, companies]) => {
                this.setState({
                    companies: companies.data,
                    following: following.data
                })
            }) 
        }
        else{
        axios.post(`${API}/users/${id}/followingCompanies`,{ 
            rating: value,
            companyId: company.id,})
            .then(() => axios.get(`${API}/users/${id}/followingCompanies`))
            .then(()=> {
                return Promise.all([getFollowing(), getCompanies()])
            }).then(([following, companies]) => {
                this.setState({
                    companies: companies.data,
                    following: following.data
                })
            }) 
        }
    }
    }
    render(){
        const {id, companies, user, loading, following, add} = this.state
        if(loading === true) return <h1>Loading...</h1>
        return (
        <div>
        <h1>Acme Company Follower</h1>
        <h2>You ({user.fullName}) are Following {following.length} Companies</h2>
        <Companies companies = {companies} following={following} id = {id} add = {this.add}/>
        </div>
        )
    }
}

ReactDOM.render(
    <App/>,
    app,
    ()=> 'rendered'
)