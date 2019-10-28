import React, {Component} from 'react'
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom'
import App from './App'
import Admin from './admin'
import Home from './pages/home'
import Login from './pages/login'
import RouterManage from './pages/routerManage'
import RoleManage from './pages/roleManage'
import CategoryManage from './pages/categoryManage'
import SysManage from './pages/sysManage'
import CollegeManage from './pages/collegeManage'
import UserManage from './pages/userManage'
import ClassManage from './pages/classManage'
import ClassDetail from './pages/classManage/classDetail'
import UserBookManage from './pages/userManage/bookManage'
import BookManage from './pages/bookManage'
import CourseManage from './pages/courseManage'
import SellerManage from './pages/sellerManage'

export default class ERouter extends Component {
  render() {
    return (
      <BrowserRouter>
        <App>
          <Switch>
            <Route path={'/login'} component={Login}/>
            <Route path={'/'}
                   render={() =>
                     <Admin>
                       <Switch>
                         <Route path={'/home'} component={Home}/>
                         <Route path={'/router/list'} component={RouterManage}/>
                         <Route path={'/role/list'} component={RoleManage}/>
                         <Route path={'/category/list'} component={CategoryManage}/>
                         <Route path={'/sysManager/list'} component={SysManage}/>
                         <Route path={'/college/list'} component={CollegeManage}/>
                         <Route path={'/user/list'} component={UserManage}/>
                         <Route path={'/user/book/list'} component={UserBookManage}/>
                         <Route path={'/class/list'} component={ClassManage}/>
                         <Route path={'/class/detail/:id'} component={ClassDetail}/>
                         <Route path={'/book/list'} component={BookManage}/>
                         <Route path={'/course/list'} component={CourseManage}/>
                         <Route path={'/seller/list'} component={SellerManage}/>

                         {/*<Redirect to={'/home'}/>*/}
                       </Switch>
                     </Admin>
                   }
            />
          </Switch>
        </App>
      </BrowserRouter>
    );
  }
}
