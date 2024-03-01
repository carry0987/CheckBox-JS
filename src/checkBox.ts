import Utils from './module/utils-ext';
import reportInfo from './module/report';
import { OnChangeCallback, OnCheckAllCallback, CheckBoxOption, TotalCheckbox, EnhancedElement } from './interface/interfaces';
import { defaults } from './module/config';
import './style/checkBox.css';

class CheckBox {
    private static instances: CheckBox[] = [];
    private static version: string = '__version__';
    private static firstLoad: boolean = true;
    private element: string | HTMLInputElement | null = null;
    private options: CheckBoxOption = defaults;
    private id: number = 0;
    private allElement: EnhancedElement[] = []; // Store all elements here which will be used in destroy method
    private total: TotalCheckbox = {input: [], checked: [], list: []};
    private checkAllElement: EnhancedElement[] = [];
    private lastChecked?: EnhancedElement;

    // Methods for external use
    private onChangeCallback?: OnChangeCallback;
    private onCheckAllCallback?: OnCheckAllCallback;

    constructor(element: string | HTMLInputElement, option: Partial<CheckBoxOption>) {
        this.init(element, option, CheckBox.instances.length);
        CheckBox.instances.push(this);

        if (CheckBox.instances.length === 1 && CheckBox.firstLoad === true) {
            reportInfo(`CheckBox is loaded, version: ${CheckBox.version}`);
        }

        // Set firstLoad flag to false
        CheckBox.firstLoad = false;
    }

    private init(elements: string | HTMLInputElement, option: Partial<CheckBoxOption>, id: number) {
        let elem = Utils.getElem<HTMLInputElement>(elements, 'all');
        if (!elem || elem.length < 1) Utils.throwError('Cannot find elements : ' + elements);
        this.id = id;
        this.element = elements;
        this.options = Utils.deepMerge({} as CheckBoxOption, this.options, option);

        // Inject stylesheet
        this.injectStyles();

        // Handle callback events
        this.setupCallbacks();

        // Process each checkbox element
        elem.forEach((ele, index) => this.processCheckbox(ele, index));

        // Set up the check all checkbox, if specified in options
        if (this.options.checkAll) {
            this.processCheckAll();
        }

        return this;
    }

    private injectStyles(): void {
        // Inject stylesheet
        let styles = {};
        if (this.options?.checkMark) {
            styles = {
                '.check-box input[type=checkbox] + .checkmark:after': {
                    'background-image': 'url(' + this.options.checkMark + ')'
                }
            };
        }
        if (this.options?.styles && Object.keys(this.options.styles).length > 0) {
            styles = Utils.deepMerge({}, this.options.styles, styles);
        }
        styles && Utils.injectStylesheet(styles, this.id.toString());
    }

    private setupCallbacks(): void {
        // Handle onChange event
        this.onChange = (total, target) => {if (this.options?.onChange) this.options.onChange(total, target)};
        // Handle onCheckAll event
        this.onCheckAll = (checkedAll) => {if (this.options?.onCheckAll) this.options.onCheckAll(checkedAll)};
    }

    private processCheckbox(ele: HTMLInputElement, index: number): void {
        if (ele.type !== 'checkbox') return;
        if (ele.hasAttribute('data-checkbox')) return;
        ele.setAttribute('data-checkbox', 'true');

        // Handle checkbox title
        let labelSibling = ele.nextElementSibling as HTMLElement;
        let bindLabel = this.options.bindLabel ?? false;
        let { title, remainLabel, randomID, labelToRestore } = Utils.handleCheckboxTitle(ele, labelSibling);
        bindLabel = remainLabel ? true : bindLabel;

        // Handle checkbox checked status
        if (ele.checked) {
            Utils.toggleCheckStatus(ele, true);
        } else {
            if (this.options.checked) {
                // Initialize checkbox checked status based on options
                this.updateCheckboxStatus(ele, index);
            }
        }

        // Insert checkbox
        let { cloneEle, labelNode } = Utils.insertCheckbox(this.id.toString(), ele, randomID, remainLabel);

        // Insert checkbox title
        Utils.insertCheckboxTitle(title, bindLabel, labelNode, cloneEle);

        // Add event listener
        let checkBoxChange = this.checkBoxChange.bind(this, true, cloneEle, undefined);
        cloneEle.addEventListener('change', checkBoxChange);
        cloneEle.checkBoxChange = checkBoxChange;
        // Add event listener for shift-click
        Utils.addEventListener(cloneEle, 'shift-click', this.handleShiftClick);
        this.updateLastChecked(cloneEle, true);

        // Store the cloned checkbox
        this.allElement.push(cloneEle);

        // Store label
        cloneEle.labelToRestore = labelToRestore;
    }

    private updateCheckboxStatus(ele: HTMLInputElement, index: number): void {
        // Logic to determine if a checkbox should be checked based on the provided options
        const checkedOption = this.options.checked;
        // Handle different types of 'checked' option
        if (typeof checkedOption === 'boolean') {
            Utils.toggleCheckStatus(ele, checkedOption);
        } else if (typeof checkedOption === 'string' || typeof checkedOption === 'number') {
            if (ele.value === checkedOption.toString() || index === Number(checkedOption)) {
                Utils.toggleCheckStatus(ele, true);
            }
        } else if (Array.isArray(checkedOption)) {
            if (checkedOption.includes(ele.value)) {
                Utils.toggleCheckStatus(ele, true);
            }
        }
    }

    private processCheckAll(): void {
        // Retrieve the check all element
        const checkAllElements = Utils.getCheckAllElements(this.options.checkAll);
        if (checkAllElements.length === 0) return;

        checkAllElements.forEach(checkAll => {
            if (!checkAll || checkAll.type !== 'checkbox') return;
            if (checkAll.hasAttribute('data-checkbox')) return;
            checkAll.setAttribute('data-checkbox', 'true');

            // Handle the label associated with the check all checkbox
            const labelSibling = checkAll.nextElementSibling as HTMLElement;
            let { title, remainLabel, randomID, labelToRestore } = Utils.handleCheckboxTitle(checkAll, labelSibling);

            // If a title has been found and is true, retrieve the label's content
            if (title && labelSibling && labelSibling.tagName === 'LABEL') {
                title = labelSibling.textContent || title;
                labelSibling.parentNode?.removeChild(labelSibling);
            }

            // Insert the check all checkbox template
            const { cloneEle, templateNode, labelNode } = Utils.insertCheckbox(this.id.toString(), checkAll, randomID, remainLabel);

            // Replace the original checkbox with the new template
            checkAll.parentNode?.replaceChild(templateNode.firstElementChild || templateNode, checkAll);

            // Insert the title for the check all checkbox
            Utils.insertCheckboxTitle(title, this.options.bindLabel ?? false, labelNode, cloneEle);

            cloneEle.addEventListener('change', this.checkAllChange);
            cloneEle.checkAllChange = this.checkAllChange;
            cloneEle.labelToRestore = labelToRestore;

            // Store the cloned check all checkbox
            this.checkAllElement.push(cloneEle);

            // Set the initial check status based on provided options
            if (this.options.checked === true || checkAll.checked) {
                Utils.toggleCheckStatus(cloneEle, true);
                cloneEle.dispatchEvent(new Event('change'));
            }
        });
    }

    private checkBoxChange(toggleCheckAll: boolean, target?: EnhancedElement, checkStatus?: boolean): void {
        this.updateTotal();
        if (toggleCheckAll) {
            this.updateCheckAllStatus();
        }
        this.onChangeCallback?.(this.total, target);
        if (target) {
            Utils.toggleCheckStatus(target, checkStatus ?? target.checked);
        }

        this.dispatchCheckboxChangeEvent();
    }

    private checkAllChange = (e: Event): void => {
        if (!(e.target instanceof HTMLInputElement)) return;
        const checkedAll = e.target.checked;

        // Toggle the status for all checkboxes
        this.allElement.forEach((checkbox) => {
            Utils.toggleCheckStatus(checkbox, checkedAll);
        });

        // Update the total and check all status
        this.updateTotal();
        this.updateCheckAllStatus();

        // Update the check all status and invoke the callback
        this.checkBoxChange(false);
        if (this.onCheckAllCallback) this.onCheckAllCallback(checkedAll);
    }

    private updateTotal(): void {
        const total = this.total;
        total.list = [];
        total.input = [];
        total.checked = [];
        this.allElement.forEach((checkbox) => {
            total.input.push(checkbox);
            if (checkbox.checked) {
                total.list.push(checkbox.value);
                total.checked.push(checkbox);
            }
        });
    }

    private updateCheckAllStatus(): void {
        if (this.checkAllElement.length > 0) {
            const totalChecked = this.total.checked.length;
            const totalInputs = this.total.input.length;
            const isAllChecked = totalChecked === totalInputs;
            this.checkAllElement.forEach((checkAll) => {
                Utils.toggleCheckStatus(checkAll, isAllChecked);
            });
        }
    }

    private dispatchCheckboxChangeEvent(): void {
        const customEvent = Utils.createEvent('checkbox-change', { detail: this.total });
        Utils.dispatchEvent(customEvent);
    }

    private handleShiftClick = (e: CustomEvent): void => {
        if (this.lastChecked && !this.lastChecked.checked) {
            this.lastChecked = undefined;
            return;
        }

        const target = e.detail.checkedElement as EnhancedElement;

        if (!this.lastChecked || this.lastChecked === target) {
            this.lastChecked = target;
            return;
        }

        let start = this.allElement.indexOf(this.lastChecked);
        let end = this.allElement.indexOf(target);

        reportInfo(this.allElement[start]);
        reportInfo(target);

        // If there's a last checked element and the shift key is being held down
        // Check/uncheck all checkboxes from lastChecked to the target checkbox
        if (this.lastChecked && start !== -1 && end !== -1) {
            reportInfo('Shift-click event detected');
            const min = Math.min(start, end);
            const max = Math.max(start, end);
            for (let i = min; i <= max; i++) {
                const shouldBeChecked = target.checked; // Match the target's checked state
                const checkbox = this.allElement[i];
                
                Utils.toggleCheckStatus(checkbox, shouldBeChecked);
            }
            this.updateTotal();
            this.updateCheckAllStatus();
            this.dispatchCheckboxChangeEvent();
        }

        this.lastChecked = target; // Update lastChecked reference for next shift-click operation
    }

    private updateLastChecked(target?: EnhancedElement, preserve: boolean = false): void {
        if (!target) return;
        if (target.checked) {
            this.lastChecked = target;
            return;
        }
        if (preserve) return;
        this.lastChecked = undefined;
    }

    private destroy(): void {
        // Reset firstLoad flag
        CheckBox.firstLoad = false;
        // Remove event listeners from all elements
        this.allElement.forEach(element => {
            Utils.restoreElement(element);
        });

        // Clear the checkAll event if it exists
        if (this.checkAllElement.length > 0) {
            this.checkAllElement.forEach((checkAll) => {
                if (checkAll.checkAllChange) {
                    Utils.toggleCheckAll(this.checkAllElement);
                    Utils.restoreElement(checkAll);
                }
            });
        }

        // Reset instance variables
        this.element = null;
        this.options = defaults;
        this.allElement = [];
        this.total = { input: [], checked: [], list: [] };
        this.checkAllElement = [];

        // Remove any injected stylesheets
        Utils.removeStylesheet(this.id.toString());

        // Update the static instances array, removing this instance
        const index = CheckBox.instances.indexOf(this);
        if (index !== -1) {
            CheckBox.instances.splice(index, 1);
        }
    }

    // Methods for external use
    public set onChange(callback: OnChangeCallback) {
        this.onChangeCallback = callback;
    }

    public set onCheckAll(callback: OnCheckAllCallback) {
        this.onCheckAllCallback = callback;
    }

    /**
     * Get all checkbox elements
     * @return {EnhancedElement[]} All checkbox elements
     */
    public get elements(): EnhancedElement[] {
        return this.allElement;
    }

    public getCheckBox(): TotalCheckbox {
        return this.total;
    }

    public refresh(): void {
        // Re-initialize the current instance
        if (this.element) {
            this.init(this.element, this.options, this.id);
        }
    }

    static destroyAll(): void {
        // Call destroy on all instances
        while (CheckBox.instances.length) {
            const instance = CheckBox.instances[0];
            instance.destroy();
        }
    }
}

export default CheckBox;
