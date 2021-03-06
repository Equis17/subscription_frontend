export default {
  //public
  getPublicKey: '/api/public/getPublicKey',                          //获取公钥
  getCaptcha: '/api/public/getCaptcha',                              //获取验证码
  getPublicRoleList: '/api/public/getRoleList',                      //获取公共角色列表
  login: '/api/public/Login',                                        //登录
  getExcel: '/api/public/getExcel/',                                 //获取书单excel文件
  getExcelDetail: '/api/public/getExcelDetail/',                                 //获取书单excel文件

  //client
  getClientCategoryList: '/api/client/category/getList',             //获取用户菜单列表
  getClientInfo: '/api/client/user/getInfo',                         //获取用户信息
  editClientInfo: '/api/client/user/editInfo',
  getUserClassList: '/api/client/classManage/getUserClassList',
  getUserBookListInfo: '/api/client/bookList/getUserBookList',
  getUserBook: '/api/client/book/getUserBook',
  applyBook: '/api/client/book/applyBook',
  editBookList: '/api/client/bookList/edit/',
  getToSubList: '/api/client/bookList/getToSubList',
  addBookQuote: '/api/client/quote/add',
  getQuotedList: '/api/client/quote/getList',
  updateBookQuote: '/api/client/quote/update/',
  getClientBookList: '/api/client/userBook/getList',
  handleUserBook: '/api/client/userBook/handle',
  getClientUserBook: '/api/client/userBook/getUserBook',
  cancelQuote: '/api/client/quote/cancel',
  addToOrder: '/api/client/order/addToOrder',
  getClientOrderList: '/api/client/order/getList',
  deleteClientOrder: '/api/client/order/delete/',
  updateClientOrder: '/api/client/order/update/',
  getClientUserOrderList: '/api/client/order/getUserList',
  getAssignerBookList: '/api/client/bookList/getAssignerBookList',
  getSubscriptionListByAssigner: '/api/client/subscription/getList',
  getAssignerBookListWithClass: '/api/client/bookList/getAssignerBookListWithClass',
  getAssignerClassList: '/api/client/classManage/getAssignerClassList',
  addClassByUser: '/api/client/classManage/addClass',
  //router
  getRouterList: '/api/sys/router/getList',
  addRouter: '/api/sys/router/add',
  deleteRouter: '/api/sys/router/delete/',
  updateRouter: '/api/sys/router/update/',
  //role
  getRoleList: '/api/sys/role/getList',
  addRole: '/api/sys/role/add',
  deleteRole: '/api/sys/role/delete/',
  updateRole: '/api/sys/role/update/',
  //category
  getCategoryList: '/api/sys/category/getList',
  addCategory: '/api/sys/category/add',
  updateCategory: '/api/sys/category/update/',
  //sysManager
  getSysManagerList: '/api/sys/sysManager/getList',
  addSysManager: '/api/sys/sysManager/add',
  deleteSysManager: '/api/sys/sysManager/delete/',
  updateSysManager: '/api/sys/sysManager/update/',
  //College
  getCollegeList: '/api/sys/college/getList',
  addCollege: '/api/sys/college/add',
  deleteCollege: '/api/sys/college/delete/',
  updateCollege: '/api/sys/college/update/',
  //User
  getUserList: '/api/sys/userManage/getList',
  getTeacherList: '/api/sys/userManage/getTeacherList',
  getAssignUserList: '/api/sys/userManage/getAssignUserList',
  getAssignerList: '/api/sys/userManage/getAssignerList',
  addUser: '/api/sys/userManage/add',
  addAssigner: '/api/sys/userManage/addAssigner',
  deleteUser: '/api/sys/userManage/delete/',
  updateUser: '/api/sys/userManage/update/',
  updateAssigner: '/api/sys/userManage/updateAssigner/',
  //Class
  getClassList: '/api/sys/classManage/getList',
  addClass: '/api/sys/classManage/add',
  deleteClass: '/api/sys/classManage/delete/',
  updateClass: '/api/sys/classManage/update/',
  getClassListByClassId: '/api/sys/classManage/getListByClassId/',
  //Book
  getBookList: '/api/sys/book/getList',
  getBookQuoteList: '/api/sys/book/getBookQuoteList',
  addBook: '/api/sys/book/add',
  deleteBook: '/api/sys/book/delete/',
  updateBook: '/api/sys/book/update/',
  //Course
  getCourseList: '/api/sys/course/getList',
  addCourse: '/api/sys/course/add',
  deleteCourse: '/api/sys/course/delete/',
  updateCourse: '/api/sys/course/update/',
  getCourseBookList: '/api/sys/course/detail/getList/',
  updateCourseBook: '/api/sys/course/detail/update/',
  deleteCourseBook: '/api/sys/course/detail/delete/',
  //Seller
  getSellerList: '/api/sys/seller/getList',
  getSellerSelectList: '/api/sys/seller/getSelectList',
  addSeller: '/api/sys/seller/add',
  deleteSeller: '/api/sys/seller/delete/',
  updateSeller: '/api/sys/seller/update/',
  //courseBookManage
  getSysCourseBookList: '/api/sys/courseBook/getList',
  addSysCourseBook: '/api/sys/courseBook/add',
  deleteSysCourseBook: '/api/sys/courseBook/delete/',
  updateSysCourseBook: '/api/sys/courseBook/update/',
  //UserBook
  getUserBookList: '/api/sys/userBook/getList',
  addUserBook: '/api/sys/userBook/add',
  deleteUserBook: '/api/sys/userBook/delete/',
  updateUserBook: '/api/sys/userBook/update/',
  getUserBookListById: '/api/sys/userBook/getBookListByUserId/',
  updateUserBookDetail: '/api/sys/userBook/updateDetail/',
  //Quote
  getQuoteList: '/api/sys/quote/getList',
  addQuote: '/api/sys/quote/add',
  deleteQuote: '/api/sys/quote/delete/',
  updateQuote: '/api/sys/quote/update/',
  subQuote: '/api/sys/quote/sub',
  //BookList
  getBookLists: '/api/sys/bookList/getList',
  addBookLists: '/api/sys/bookList/add',
  deleteBookLists: '/api/sys/bookList/delete/',
  updateBookLists: '/api/sys/bookList/update/',
  //AssignManage
  getAssignList: '/api/sys/assign/getList',
  addAssign: '/api/sys/assign/add',
  deleteAssign: '/api/sys/assign/delete/',
  updateAssign: '/api/sys/assign/update/',
  //SubscriptionManage
  getSubscriptionList: '/api/sys/subscription/getList',
  addSubscription: '/api/sys/subscription/add',
  deleteSubscription: '/api/sys/subscription/delete/',
  updateSubscription: '/api/sys/subscription/update/',
  //OrderManage
  getOrderList: '/api/sys/order/getList',
  addOrder: '/api/sys/order/add',
  deleteOrder: '/api/sys/order/delete/',
  updateOrder: '/api/sys/order/update/',
};
