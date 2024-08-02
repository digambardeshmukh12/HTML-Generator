import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.css']
})
export class HtmlEditorComponent {
  tableDialogRef: MatDialogRef<any> | null = null;
  codeDialogRef: MatDialogRef<any> | null = null;

  constructor(

    private dialog: MatDialog
  ) { }


  ngOnInit() {
    debugger
  }

  @ViewChild('editorRef') editorRef!: ElementRef;
  @ViewChild('tableDialog') tableDialog!: TemplateRef<any>;
  @ViewChild('codeDialog') codeDialog!: TemplateRef<any>;

  editorContent: string = '';
  htmlContent: string = '';
  showTableDialog: boolean = false;
  tableRows: number = 0;
  tableCols: number = 0;

  // Apply formatting commands
  format(command: string, value?: string) {
    this.editorRef.nativeElement.focus();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Apply font size to newly entered text
      if (command === 'fontSize') {
        const span = document.createElement('span');
        span.style.fontSize = this.fontside;
        range.surroundContents(span);
      } else {
        document.execCommand(command, false, value);
      }
    }
  }

  AddOrder(command: 'insertOrderedList' | 'insertUnorderedList') {
    const editor = this.editorRef.nativeElement;

    // Insert the new list
    editor.innerHTML += command === 'insertOrderedList'
      ? '<ol><li>List item</li></ol>'
      : '<ul><li>List item</li></ul>';

    // Apply default list styles if needed
    const listElements = editor.querySelectorAll('ol, ul');
    listElements.forEach((list: { style: { listStyleType: string; }; }) => {
      list.style.listStyleType = command === 'insertOrderedList' ? 'decimal' : 'disc';
    });

    // Set focus to the editor
    editor.focus();
  }

  fontside = '16'
  formatText(size: string) {
    const selection = window.getSelection();
    if(selection != null){
      const range = selection.getRangeAt(0);
      const selectedText = range.extractContents();
      const span = document.createElement('span');
      this.editorRef.nativeElement.focus();
  
      span.style.fontSize = size;
      if (size === 'larger') {
        this.fontside = (parseInt(this.fontside, 10) + 2).toString();
      } else {
        this.fontside = (parseInt(this.fontside, 10) - 2).toString();
      }
  
      span.appendChild(selectedText);
  
      range.insertNode(span);
  
      // Trigger change detection to update the view
      this.updateContent();
    }

 
  }

  openTableDialog() {
    this.tableDialogRef = this.dialog.open(this.tableDialog, {
      width: '400px'
    });
  }

  openCodeDialog() {
    const editor = document.querySelector('.editor') as HTMLElement;
    if (editor) {
      this.htmlContent = editor.innerHTML;
    }
    this.codeDialogRef = this.dialog.open(this.codeDialog, {
      width: '400px'
    });
  }

  closeTableDialog() {
    if (this.tableDialogRef) {
      this.tableDialogRef.close();
      this.tableDialogRef = null;
    }
  }

  closeCodeDialog() {
    if (this.codeDialogRef) {
      this.codeDialogRef.close();
      this.codeDialogRef = null;
    }
  }

  // Create a link
  createLink() {
    const url = prompt("Enter the link URL");
    if (url) {
      document.execCommand('createLink', false, url);
    }
  }

  // Change the font size
  changeFontSize(event: Event) {
    const select = event.target as HTMLSelectElement;
    const size = select.value;
    this.format('fontSize', size);
  }

  // Change the font family
  changeFontFamily(event: Event) {
    const select = event.target as HTMLSelectElement;
    const family = select.value;
    this.format('fontName', family);
  }

  changeTextColor(event: Event) {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this.applyFormat('foreColor', color);
  }

  changeBackgroundColor(event: Event) {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this.applyFormat('hiliteColor', color);
  }

  applyFormat(command: string, value?: string) {
    this.editorRef.nativeElement.focus();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      document.execCommand(command, false, value);
    }
  }

  // Insert a table into the editor
  insertTable(event: Event) {
    event.preventDefault(); // Prevent form submission
debugger
    if (this.tableRows > 0 && this.tableCols > 0) {
      let tableHtml = '<table border="1" style="border: 1px solid #ddd;">';
      for (let i = 0; i < this.tableRows; i++) {
        tableHtml += '<tr style=" border: 1px solid #ddd;">';
        for (let j = 0; j < this.tableCols; j++) {
          tableHtml += '<td style=" padding: 0 20px; border: 1px solid #ddd;">&nbsp;</td>';
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table>';
      this.insertHtmlAtCaret(tableHtml, this.editorRef.nativeElement);
    } else {
      alert('Invalid input. Please enter positive integers for rows and columns.');
    }
    this.closeTableDialog();

  }

  insertHtmlAtCaret(html: string, editor: HTMLElement) {
    // Ensure the focus stays within the editor
    editor.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node, lastNode;
      while ((node = tempDiv.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      // Move the caret immediately after the inserted content
      if (lastNode) {
        const newRange = range.cloneRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
  }

  // Update editorContent when content changes
  updateContent() {
    const editor = document.querySelector('.editor') as HTMLElement;
    if (editor) {
      this.editorContent = editor.innerHTML;
    }
  }

  // Remove the currently selected row from the table
  removeRow() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const currentRow = (range.startContainer as Element).closest('tr');
      if (currentRow) {
        currentRow.remove();
      }
    }
  }

  // Remove the currently selected column from the table
  removeColumn() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const table = this.findAncestor(range.startContainer, 'table');
      if (table) {
        const cell = this.findAncestor(range.startContainer, 'td');
        if (cell) {
          const index = Array.from(cell.parentNode?.children ?? []).indexOf(cell);
          table.querySelectorAll('tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells[index]) {
              cells[index].remove();
            }
          });
        }
      }
    }
  }

  // Helper function to find the ancestor element of a given type
  private findAncestor(node: Node | null, tagName: string): HTMLElement | null {
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === tagName.toLowerCase()) {
        return node as HTMLElement;
      }
      node = node.parentNode;
    }
    return null;
  }
  // Undo the last action
  undo() {
    document.execCommand('undo');
  }

  // Redo the last undone action
  redo() {
    document.execCommand('redo');
  }

  copyCode() {
    const textarea = document.createElement('textarea');
    textarea.value = this.htmlContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Code copied to clipboard!');
  }
}
