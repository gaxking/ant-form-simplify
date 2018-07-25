import React, {Component, PropTypes} from 'react';
import Form from "./form.jsx";

class FormFormClass extends Form {
	constructor(props) {
		if(props.labelWidth) {
			try{
				props.formItemLayout.labelCol.style.width = props.labelWidth+"px";
			}catch(e){}
		}
		super(props);
	}
};

FormFormClass.defaultProps = {
	formClassName : "c-form",
	submitButtonStr : "完成保存",
	resetButtonStr : "重置",
	backButtonStr : "取消保存",
	layout: "Horizontal",
	formItemLayout:{
		labelCol: { span: 3, style:{width:"110px"}},
		wrapperCol: { span: 14 }
	},
	buttonItemLayout:{
		wrapperCol: { span: 14, offset: 3 }
	}
};

export default FormFormClass;
