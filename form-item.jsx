import React, {Component, PropTypes} from 'react';
import {Form} from 'antd';
const FormItem = Form.Item;

class FormItemClass extends Component {
	constructor(props) {
		super(props);
	}

	getChild() {
		let {getFieldDecorator, fatherOnChange, resetSaveFun, initialValue, children, name, rules, onChange, configs, formData, formItemLayout, labels, disabled, formName, ...props} = this.props;

		if(children.props.isItems === true) {
			let config = {configs, getFieldDecorator, fatherOnChange, resetSaveFun, labels, formData, formName, formItemLayout};
			return React.cloneElement(children, config);
		}else{
			let tmpOptions = {}, result = {};
			if(rules)tmpOptions['rules'] = rules;
			tmpOptions['initialValue'] = initialValue;

			var onChangeExt = function(e, isInit) {
				let value;
				//部分自定义的控件e就是value，如RangePacker
				if (!e || !e.target) {
					//把ant的monnent时间做转换
					value = e;
				}else{
					value = e.target.value;
				}

				if(onChange) {
					let res = onChange(value, name, isInit);  //子控件的onChnage
					if(Object.prototype.toString.call(res) === '[object Object]') {
						result = res;
					}
				}
				result[name] = value;
				fatherOnChange(result);
			};
			tmpOptions['onChange'] = onChangeExt;

			labels[name] = props.label;

			return (<FormItem {...props} {...formItemLayout}>
				{getFieldDecorator(name, tmpOptions)(
					React.cloneElement(children, disabled===undefined?{...children.props, resetSaveFun, formName, onChangeExt}:{...children.props, disabled, resetSaveFun, formName, onChangeExt})
				)}
			</FormItem>);
		}

	}



	render() {
		return this.getChild();
	}
}

FormItemClass.propTypes = {
	name : PropTypes.string,
	fatherOnChange : PropTypes.func,
	configs : PropTypes.array
};

FormItemClass.defaultProps = {
	colon: true
};

export default FormItemClass;
