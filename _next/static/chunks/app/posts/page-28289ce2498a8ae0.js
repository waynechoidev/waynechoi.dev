(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[593,703],{6394:function(e,s,t){Promise.resolve().then(t.bind(t,1342)),Promise.resolve().then(t.t.bind(t,8326,23))},1342:function(e,s,t){"use strict";t.r(s),t.d(s,{default:function(){return PostList}});var n=t(7437),r=t(1396),c=t.n(r),o=t(4033);function PostList(e){let{list:s}=e,t=(0,o.useRouter)();return(0,n.jsx)("div",{className:"mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2",children:s.map(e=>(0,n.jsxs)("div",{className:"p-5 shadow-lg rounded-xl cursor-pointer hover:bg-blue-50",onClick:()=>t.push("/posts/".concat(e.category,"/").concat(e.slug)),children:[(0,n.jsx)("h3",{children:e.title}),(0,n.jsx)("p",{className:"text-gray-400 text-sm m-0 mt-1",children:e.date}),(0,n.jsx)("p",{children:e.excerpt}),e.tags.map(e=>(0,n.jsx)(c(),{href:"",className:"mr-2 text-gray-500",children:"#".concat(e)},e))]},e.slug))})}t(2265)},1396:function(e,s,t){e.exports=t(8326)},4033:function(e,s,t){e.exports=t(94)}},function(e){e.O(0,[122,971,472,744],function(){return e(e.s=6394)}),_N_E=e.O()}]);