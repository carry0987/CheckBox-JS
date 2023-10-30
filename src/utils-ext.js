import Utils from '@carry0987/utils';
import reportInfo from './report';

Utils.setStylesheetId = 'checkbox-style';
Utils.setReplaceRule('.check-box', '.check-box-');

Utils.getTemplate = function(id) {
    let template = `
    <div class="checkbox check-box-${id}">
        <span class="checkmark"></span>
        <label class="checkbox-label"></label>
    </div>
    `;
    return template;
}

Utils.handleCheckboxTitle = function(ele, labelSibling) {
    let ramainLabel = false, randomID = null, isValidLabel = false;
    let title = ele?.title || ele?.dataset?.checkboxTitle;

    if (labelSibling && labelSibling.tagName === 'LABEL') {
        isValidLabel = labelSibling.cloneNode(true);
        title = (() => { // using IIFE
            if (!Utils.isEmpty(ele.id)) {
                if (labelSibling?.htmlFor === ele.id) {
                    ramainLabel = true;
                    return true;
                }
                if (labelSibling?.dataset?.checkboxFor === ele.id) {
                    return true;
                }
            }
            if (ele?.dataset?.checkboxId && labelSibling?.dataset?.checkboxFor === ele?.dataset?.checkboxId) {
                randomID = Utils.isEmpty(ele.id) && Utils.isEmpty(labelSibling.htmlFor) ? 'check-' + Utils.generateRandom(6) : null;
                return true;
            }
            return null;
        })();
    }
    return [title, ramainLabel, randomID, isValidLabel];
}

Utils.insertCheckbox = function(id, ele, randomID, ramainLabel) {
    let template = Utils.getTemplate(id);
    let templateNode = document.createElement('div');
    templateNode.innerHTML = template.trim();
    let checkmarkNode = Utils.getElem('.checkmark', templateNode);
    let labelNode = Utils.getElem('label', templateNode);
    let cloneEle = ele.cloneNode(true);
    if (randomID) {
        cloneEle.id = randomID;
    }
    if (ramainLabel === true) {
        labelNode.htmlFor = cloneEle.id;
    }
    checkmarkNode.addEventListener('click', (e) => {
        e.preventDefault();
        cloneEle.click();
    });
    checkmarkNode.parentNode.insertBefore(cloneEle, checkmarkNode);
    return [cloneEle, templateNode, labelNode];
}

Utils.insertCheckboxTitle = function(title, bindLabel, labelNode, cloneEle) {
    if (!title) {
        labelNode.parentNode.removeChild(labelNode);
    } else {
        labelNode.textContent = title;
        if (bindLabel === true) {
            labelNode.classList.add('checkbox-labeled');
            labelNode.addEventListener('click', (e) => {
                e.preventDefault();
                cloneEle.click();
            });
        }
    }
}

Utils.toggleCheckStatus = function(ele, checked) {
    if (checked) {
        ele.checked = true;
        ele.setAttribute('checked', 'checked');
    } else {
        ele.checked = false;
        ele.removeAttribute('checked');
    }
}

Utils.toggleCheckAll = function(ele, total) {
    let checkAll = Utils.getElem(ele);
    if (!checkAll) return;
    if (total && total.checked && total.input) {
        Utils.toggleCheckStatus(checkAll, (total.checked.length !== total.input.length || total.checked.length === 0) === false);
    } else {
        Utils.toggleCheckStatus(checkAll, false);
    }
}

Utils.restoreElement = function(element) {
    element.removeEventListener('change', element.checkBoxChange);
    element.checkBoxChange = null;
    element.removeAttribute('data-checkbox');
    let parentElement = element.parentNode;
    parentElement.replaceWith(element);
    let labelNode = element.isValidLabel;
    if (labelNode && labelNode.nodeType === Node.ELEMENT_NODE) {
        element.parentNode.insertBefore(labelNode, element.nextSibling);
    }
}

export default Utils;
