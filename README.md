##物业后台新封装的form组件 
 
###改进如下
* 结合redux的数据流做了双向绑定，解决了原本需要写onChange实现双向绑定的冗余代码 
old code:
```javascript
   jsx :
        <SearchForm name="search" formData={search} 
            onChange={(data)=>{setDataAction(data)}} >
        ...
   action:
        setDataAction(data){
        ....
            dispatch({type:"CHANGE_DATA",data:data})
        }
   }
   reducer:
        function reducer(state, action) {
        	...
        	case ActionType.CHANGEDATA:
        		return Object.assign({}, state, action.data);
            ...
        }
```
new code:
```javascript
    jsx:
    <SearchForm name="search" formData={search}>
    ...
    function mapStatetoProps(state) {
	    return {
		    ...
		    search:state.form.search
	    };
    }
    export default Connect(reducer)(mapStatetoProps)(Index);
```


* 辅助RangePicker组件生成新的对象key，包括输入formData和输出，不需要在项目写转换代码 
old code:
```javascript
   jsx :
        search.time = [search.beginTime, search.endTime];
        delete search.beginTime;
        delete search.endTime;
        <SearchForm name="search" formData={search} 
            onSubmit={(data)=>{setDataAction(data)}}>
            <SearchForm.Item label="生成结算单时间:" name="time" >
				<RangePicker format="YYYY/MM/DD" />
			</SearchForm.Item>
            ...
   action:
        setDataAction(data){
        ....
            data.beginTime = data.time[0];
            data.endTime = data.time[1];
            delete data.time;
            dispatch({type:"CHANGE_DATA",data:data})
        }
   }
```
new code
```javascript
    jsx:
        <SearchForm name="search" formData={search} 
            onSubmit={(data)=>{setDataAction(data)}}> 
            <SearchForm.Item label="生成结算单时间:" name="beginTime|endTime" >
			    <RangePicker format="YYYY/MM/DD" />
		    </SearchForm.Item>
            ...
```

* Form组件使用方法:
```javascript
   jsx :
        <Form name="search" formData={search} 
            onSubmit={(data)=>{setDataAction(data)}}>
            <Form.Item label="生成结算单时间:" name="time" >
				<RangePicker format="YYYY/MM/DD" />
			</Form.Item>
            ...
```
	跟SearchForm一样，表现上只是UI变了


* 结合and2.9的form表单基础上封装了
* 取消使用immutable.js 整天 toJS()的写法 


### 引用方法 
    import {SearchFormPlus as SearchForm, FormPlus as Form} from "components"; 

### 注意事项
	1.表单验证跟以前一样，但是引用的文件变成 import vRules from "utils/validate-wy"; 
	2.增加了复合组件，使用方法如下：
	```javascript
		<SearchForm.Item configs={
		[{rules:[vRules.require()],name:"provinceId|cityId|communityId",label:"选择项目"},
		{name:"unitId",label:"楼栋单元"},
		{name:"houseId",label:"楼层房号"}
		]} >
		<CommunityUnitHouse auto={true} />
	    </SearchForm.Item>
    ```
        configs[] 相当于正常SearchForm.Item的传入参数,只是变成数组可以多传很多参数而已
    3.resetFlag==true如果存在则显示重置按钮
    ```javascript
        <SearchForm name="search" formData={o} resetFlag = {true}>
        ...
    ```
    4.resetAction 可以保留某些字段不被重置
    ```javascript
        <SearchForm name="search" formData={o} resetFlag = {true}
				resetAction={function(data){
				let obj = {cityId:data.cityId,code:data.code};
				return obj;
			}}>
        ...
    ```

    那么 formData中的 cityId和code自动在重置按钮中不会生效 
    使用场景一般在小区帐号，小区搜索条件不能被清除掉 
 
	5.labelWidth={200}
	可以控制label的宽度，不需要自己写css控制。

	6.增加了一些参数可参考如下：
			<Form name="search" formData={search||{}}
				initData={{deptName:"abc"}}
			onSubmit={function(data){

			}}
			resetFlag = {true}
			backFlag = {true}
			backButtonStr={"取消保存文字"}
			submitButtonStr={"提交按钮文字"}
			resetButtonStr={"重置按钮的文字"}
			onChange={function(value, path, data){
				//每次修改都会触发
				//其中的data能够实时获取当前表单的对象
				if(path=="select" && value=="a"){
					data.deptName="a";
				}
				
				return data;//可以返回一个新的对象对关联的字段做出修改
			}}
			formItemLayout = {
				{labelCol: { span: 3, style:{width:"100px"}},wrapperCol: { span: 14}} //控制form表单的整体排版
			}
			buttonItemLayout = {
				{labelCol: { span: 1, style:{width:"50px"}},wrapperCol: { span: 1}} //控制bottom行的排版
			}
			disabled = {false} 
			customBtn = {<Button>自定义按钮</Button>}
			resetAction = {function(data) {
				//resetAction可以控制哪些的字段重置时不被清空
				return {deptName:data.deptName}
			}}>

author: gax 
date: 2017.5.11
#END
