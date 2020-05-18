import React, {Component} from 'react'
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom'
import App from './App'
import Admin from './admin'
import Login from './pages/Login'
import RouterManage from './pages/Router'
import RoleManage from './pages/Role'
import CategoryManage from './pages/Category'
import SysManage from './pages/sysManage'
import CollegeManage from './pages/College'
import UserManage from './pages/User'
import ClassManage from './pages/Class'
import ClassDetail from './pages/Class/classDetail'
import BookManage from './pages/Book'
import CourseManage from './pages/Course'
import SellerManage from './pages/Seller'
import UserBookManage from './pages/UserBook'
import QuoteManage from './pages/Quote'
import BooKListManage from "./pages/BookList";
import AssignManage from "./pages/Assign";
import UserInfo from "./pages/User/userInfo";
import BookListInfo from "./pages/BookList/info";
import AssignerManage from './pages/Assign/assigner'
import BookingListManage from "./pages/BookingList";
import SubscriptionManage from "./pages/Subscription";
import BookManageInfo from "./pages/Book/info";
import BookListManageEdit from "./pages/BookList/edit";
import QuoteManageInfo from "./pages/Quote/info";
import QuoteManageToSub from "./pages/Quote/toSub";
import UserBookManageInfo from "./pages/UserBook/info";
import BookManageQuote from "./pages/Book/quote";
import OrderManage from "./pages/Order";
import OrderManageEdit from "./pages/Order/edit";
import OrderManageInfo from "./pages/Order/info";
import AssignManageBookList from "./pages/Assign/bookList";
import AssignManageInfo from "./pages/Assign/info";
import JWTDecode from "jwt-decode";

export default class ERouter extends Component {

  renderRedirect() {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Redirect to={'/Login'}/>
    }
    const {_auth: roleId} = JWTDecode(token);
    return {
      1: () => <Redirect to={'/router/list'}/>,
      2: () => <Redirect to={'/college/list'}/>,
      3: () => <Redirect to={'/book/info'}/>,
      4: () => <Redirect to={'/user/userInfo'}/>,
      5: () => <Redirect to={'/quote/info'}/>,
      6: () => <Redirect to={'/assign/bookList'}/>,
    }[roleId]();
  }

  render() {

    return (
      <BrowserRouter>
        <App>
          <Switch>
            <Route path={'/Login'} component={Login}/>
            <Route path={'/'}
                   render={() =>
                     <Admin>
                       <Switch>
                         {/*<Route path={'/Home'} component={Home}/>*/}
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
                         <Route path={'/quote/list'} component={QuoteManage}/>
                         <Route path={'/bookList/list'} component={BooKListManage}/>
                         <Route path={'/assign/list'} component={AssignManage}/>
                         <Route path={'/user/userInfo'} component={UserInfo}/>
                         <Route path={'/bookList/info'} component={BookListInfo}/>
                         <Route path={'/assignerManage/list'} component={AssignerManage}/>
                         <Route path={'/bookingList/list'} component={BookingListManage}/>
                         <Route path={'/subscription/list'} component={SubscriptionManage}/>
                         <Route path={'/book/info'} component={BookManageInfo}/>
                         <Route path={'/bookList/edit'} component={BookListManageEdit}/>
                         <Route path={'/quote/info'} component={QuoteManageInfo}/>
                         <Route path={'/quote/toSub'} component={QuoteManageToSub}/>
                         <Route path={'/userBook/info'} component={UserBookManageInfo}/>
                         <Route path={'/book/quote'} component={BookManageQuote}/>
                         <Route path={'/order/list'} component={OrderManage}/>
                         <Route path={'/order/edit'} component={OrderManageEdit}/>
                         <Route path={'/assign/bookList'} component={AssignManageBookList}/>
                         <Route path={'/assign/info'} component={AssignManageInfo}/>
                         <Route path={'/order/info'} component={OrderManageInfo}/>
                         {this.renderRedirect()}
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
