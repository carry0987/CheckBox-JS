type InputElement = string | HTMLInputElement | Array<HTMLInputElement> | NodeListOf<HTMLInputElement> | null;
type CheckedTargets = boolean | string | number | Array<string | number> | null;
type CheckAllButtons = string | HTMLInputElement | Array<string | HTMLInputElement> | null;

type types_CheckAllButtons = CheckAllButtons;
type types_CheckedTargets = CheckedTargets;
type types_InputElement = InputElement;
declare namespace types {
  export type { types_CheckAllButtons as CheckAllButtons, types_CheckedTargets as CheckedTargets, types_InputElement as InputElement };
}

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

type interfaces_CheckBoxOption = CheckBoxOption;
type interfaces_CheckboxTemplate = CheckboxTemplate;
type interfaces_CheckboxTitleDetails = CheckboxTitleDetails;
type interfaces_EnhancedElement = EnhancedElement;
type interfaces_OnChangeCallback = OnChangeCallback;
type interfaces_OnCheckAllCallback = OnCheckAllCallback;
type interfaces_TotalCheckbox = TotalCheckbox;
declare namespace interfaces {
  export type { interfaces_CheckBoxOption as CheckBoxOption, interfaces_CheckboxTemplate as CheckboxTemplate, interfaces_CheckboxTitleDetails as CheckboxTitleDetails, interfaces_EnhancedElement as EnhancedElement, interfaces_OnChangeCallback as OnChangeCallback, interfaces_OnCheckAllCallback as OnCheckAllCallback, interfaces_TotalCheckbox as TotalCheckbox };
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
    constructor(element: InputElement, option: Partial<CheckBoxOption>);
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

export { CheckBox, interfaces as CheckBoxInterface, types as CheckBoxType };
