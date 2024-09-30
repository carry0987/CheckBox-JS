type CheckedTargets = boolean | string | number | Array<string | number> | null;
type CheckAllButtons = string | HTMLInputElement | Array<string | HTMLInputElement> | null;

interface OnChangeCallback {
    (total: TotalCheckbox, target?: EnhancedElement): void;
}
interface OnCheckAllCallback {
    (checkedAll: boolean): void;
}
interface CheckBoxOption {
    checked: CheckedTargets;
    checkMark: string;
    checkAll: CheckAllButtons;
    allowShiftKey: boolean;
    bindLabel: boolean;
    styles: object;
    onChange: OnChangeCallback;
    onCheckAll: OnCheckAllCallback;
}
interface TotalCheckbox {
    input: EnhancedElement[];
    checked: EnhancedElement[];
    list: string[];
}
interface CheckboxTitleDetails {
    title: string | null;
    remainLabel: boolean;
    randomID: string | null;
    labelToRestore?: HTMLLabelElement;
}
interface CheckboxTemplate {
    cloneEle: EnhancedElement;
    templateNode: HTMLDivElement;
    labelNode: HTMLLabelElement;
}
interface EnhancedElement extends HTMLInputElement {
    withID: boolean;
    checkAllChange?: EventListener;
    checkBoxChange?: EventListener;
    labelToRestore?: HTMLLabelElement;
}

declare class CheckBox {
    private static instances;
    private static version;
    private static firstLoad;
    private element;
    private options;
    private id;
    private allElement;
    private total;
    private checkAllElement;
    private onChangeCallback?;
    private onCheckAllCallback?;
    constructor(element: string | HTMLInputElement, option: Partial<CheckBoxOption>);
    private init;
    private injectStyles;
    private setupCallbacks;
    private processCheckbox;
    private updateCheckboxStatus;
    private processCheckAll;
    private checkBoxChange;
    private checkAllChange;
    private updateTotal;
    private updateCheckAllStatus;
    private dispatchCheckboxChangeEvent;
    private handleShiftClick;
    private getLastChecked;
    private destroy;
    set onChange(callback: OnChangeCallback);
    set onCheckAll(callback: OnCheckAllCallback);
    /**
     * Get all checkbox elements
     * @return {EnhancedElement[]} All checkbox elements
     */
    get elements(): EnhancedElement[];
    getCheckBox(): TotalCheckbox;
    refresh(): void;
    static destroyAll(): void;
}

export { type CheckAllButtons, type CheckBoxOption, type CheckboxTemplate, type CheckboxTitleDetails, type CheckedTargets, type EnhancedElement, type OnChangeCallback, type OnCheckAllCallback, type TotalCheckbox, CheckBox as default };
