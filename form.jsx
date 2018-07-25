import React, {Component, PropTypes} from 'react';
import {Form, Button, message} from 'antd';
import FormItem from "./form-item.jsx";
import {store} from "../../store";
import { goTo } from 'actions/route';

//检测如果有类似"startTime|endTime"的自动转成{startTime:xx,endTime:xx}
const formatArray2Object = function(formData) {
	formData = Object.assign({}, formData);

	for(let x in formData) {
		let _x = x.split("|");
		if(_x.length>1) {
			if(Object.prototype.toString.call(formData[x]) === '[object Array]') {
				formData[x].forEach((v, index)=>{
					formData[_x[index]] = v;
				});
			}
			delete formData[x];
		}else if(formData[x]==="" || formData[x]=== undefined ) {
			delete formData[x];
		}
	}

	return formData;
};

//把类似"startTime|endTime"这种结构的，重新写成数组[startTime,endTime]
const formatObject2Array = function(children, values) {
	let keys = [];
	const loop = data => data.map((v) => {
		if(v.type === FormItem && v.props.configs) {
			v.props.configs.forEach((v)=>{
				keys.push(v.name);
			});
		}else{
			if(v.type === FormItem) {
				keys.push(v.props.name);
			}else if(v.props && v.props.children) {
				let children = Object.prototype.toString.call(v.props.children) === '[object Array]'?v.props.children:[v.props.children];
				loop(children);
			}
		}
	});

	children = Object.prototype.toString.call(children) === '[object Array]'?children:[children];
	loop(children);


	let inputObj = {};

	keys.forEach(function(v) {
		let _x = v.split("|");
		if(_x.length>1) {
			let tmpArr = [];
			_x.forEach((v2, index)=>{
				if(values[v2])tmpArr[index] = values[v2];
			});
			if(tmpArr.length)inputObj[v] = tmpArr;
		}else if(values[v]!==undefined) {
			inputObj[v] = values[v];
		}
	});

	return inputObj;
};
class FormClass extends Component {
	constructor(props) {
		super(props);
		this.labels = {};
		this.resetSaveKeys = [];
		this.resetSaveKeysByObj = {};
		this.isChangeForm = 0;
	}


	handleSubmit(e) {
		e && e.preventDefault && e.preventDefault();

		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				if(this.props.onSubmit) {
					this.props.onSubmit(formatArray2Object(values));
				}else{
					e(values);
				}
			}else{
				let validateTip = [];
				for(let x in err) {
					validateTip.push(this.labels[x]+":"+err[x]['errors'][0]['message']);
				}

				message.error([
					'验证错误',
					validateTip.map(item=>{return <div>{item}</div>;})
				]);
			}
		});
	}

	render() {
		const {form, onSubmit, children, resetAction, resetFlag, backFlag, customBtn, name, formClassName, backButtonStr, submitButtonStr, resetButtonStr, onChange, layout, formItemLayout, buttonItemLayout, disabled, initData, ...props} = this.props;
		let {formData} = this.props;
		const {getFieldDecorator} = form;
		let _this = this;

		if(initData) {
			if(JSON.stringify(initData) != JSON.stringify(_this.initData)) {
				_this.initData = JSON.parse(JSON.stringify(initData));

				form.resetFields();
				store.dispatch({
					type: '@@gax/CHANGE_FORMDATA',
					data: {key:name, value:initData}
				});

				formData = {...formData, ...initData};
			}
		}

		form.submit.handleSubmit = this.handleSubmit.bind(this);
		form.resetFields.clean = function() {
			_this.initData = undefined;

			form.resetFields();
			store.dispatch({
				type: '@@gax/CLEAN_FORMDATA',
				data: {key:name}
			});
		};

		const loop = children => React.Children.map( children, (child) => {
			if(child.type === FormItem) {
				return React.cloneElement(child, {
					disabled:disabled,
					formItemLayout,
					getFieldDecorator: getFieldDecorator,
					formName:name,
					formData: formData,
					resetSaveFun:function(keys) {
						if(Object.prototype.toString.call(keys) === '[object Object]') {
							for(let x in keys) {
								_this.resetSaveKeysByObj[x] = keys[x];
							}
						}else{
							keys.forEach((v)=>{
								if(_this.resetSaveKeys.indexOf(v) === -1)_this.resetSaveKeys.push(v);
							});
						}
					},
					fatherOnChange:function(data) {
						let values = form.getFieldsValue();

						for(let x in data) {
							values[x] = data[x];
						}

						values = formatArray2Object(values);

						if(onChange) {
							for(let x in data) {
								let result = onChange(data[x], x, {...values});

								if(Object.prototype.toString.call(result) === '[object Object]') {
									values = result;
								}
							}
						}

						if(name) {
							form.resetFields();
							store.dispatch({
								type: '@@gax/CHANGE_FORMDATA',
								data: {key:name, value:values}
							});
						}
					},
					labels:this.labels
				});
			}else if(child.props && child.props.children) {
				let childrenSon = Object.prototype.toString.call(child.props.children) === '[object Array]'?child.props.children:[child.props.children];

				return React.cloneElement(child, {children:loop(childrenSon)});
			}else{
				return child;
			}
		});

		return (
			<Form className={formClassName} onSubmit={this.handleSubmit.bind(this)} {...props} layout={layout}>

			{loop(children)}

			{backFlag||onSubmit||resetFlag||customBtn?
			<Form.Item {...buttonItemLayout}>
				<div style={{display:"inline-block", verticalAlign:"top"}}>
					{backFlag?<Button className="c-form-btn-back" onClick={function() {
						goTo(location.pathname.match(/(\/[^\/]+){3}/)[0]);    //返回第三级路由
					}} >{backButtonStr}</Button>:''}
					{onSubmit?<Button className="c-form-btn-save" type="primary" htmlType="submit">{submitButtonStr}</Button>:''}
					{resetFlag?
						<Button className="c-form-btn-clear" onClick={function() {
			let values = formatArray2Object(form.getFieldsValue());

			let tmp = {};
			_this.resetSaveKeys.forEach((v)=>{
				tmp[v] = values[v];
			});

			for(let x in _this.resetSaveKeysByObj) {
				tmp[x] = _this.resetSaveKeysByObj[x];
			}


			let result = resetAction?resetAction({...values, ...tmp}):tmp;
			if(Object.prototype.toString.call(result) === '[object Object]') {
				values = result;
			}else{
				values = tmp;
			}

							form.resetFields();
			store.dispatch({
				type: '@@gax/CHANGE_FORMDATA',
				data: {key:name, value:values}
			});
		}}>
						{resetButtonStr}
					</Button>:''}
					{customBtn?customBtn:''}
				</div>
			</Form.Item>:''}
		</Form>
		);
	}
}

const WrappedIndex = Form.create({
	mapPropsToFields(props) {
		let tmp = Object.assign({}, props.formData);

		tmp = formatObject2Array(props.children, tmp);

		for(let x in tmp) {
			tmp[x] = {value:tmp[x]};
		}
		return tmp;
	}
})(FormClass);

WrappedIndex.Item = FormItem;

WrappedIndex.propTypes = {
	onSubmit : PropTypes.func,
	resetAction : PropTypes.func,
	initData : PropTypes.object,
	resetFlag: PropTypes.bool,
	backFlag: PropTypes.bool,
	disabled: PropTypes.bool,
	backButtonStr:PropTypes.string,
	submitButtonStr:PropTypes.string,
	resetButtonStr:PropTypes.string,
	onChange:PropTypes.func,
	formItemLayout:PropTypes.object,
	buttonItemLayout:PropTypes.object
};

export default WrappedIndex;

