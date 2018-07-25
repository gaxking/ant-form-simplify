import React, {Component, PropTypes} from 'react';
import Form from "./form.jsx";

class SearchFormClass extends Form {
	constructor(props) {
		super(props);
	}
};

SearchFormClass.defaultProps = {
	formClassName : "wuye-search-form",
	submitButtonStr : "查询",
	resetButtonStr : "清除",
	layout: "inline"
};

export default SearchFormClass;
