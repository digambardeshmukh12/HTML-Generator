import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.css']
})
export class HtmlEditorComponent {
  @ViewChild('editorRef') editorRef!: ElementRef;
  editorContent: string = '';
  htmlContent: string = '';
  showTableDialog: boolean = false;
  tableRows: number = 0;
  tableCols: number = 0;

  // Apply formatting commands
  format(command: string, value?: string) {
    document.execCommand(command, false, value);
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

  // Change the text color
  changeTextColor(event: Event) {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this.format('foreColor', color);
  }

  // Change the background color
  changeBackgroundColor(event: Event) {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this.format('hiliteColor', color);
  }

  // Toggle the visibility of the table dialog
  toggleTableDialog() {
    this.showTableDialog = !this.showTableDialog;
  }

  // Insert a table into the editor
  insertTable(event: Event) {
    event.preventDefault(); // Prevent form submission

    if (this.tableRows > 0 && this.tableCols > 0) {
      let tableHtml = '<table border="1" style="  border-collapse: collapse;">';
      for (let i = 0; i < this.tableRows; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < this.tableCols; j++) {
          tableHtml += '<td style=" padding: 0 20px;">&nbsp;</td>';
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table>';
      this.insertHtmlAtCaret(tableHtml ,  this.editorRef.nativeElement);
      this.toggleTableDialog(); // Close dialog after insertion
    } else {
      alert('Invalid input. Please enter positive integers for rows and columns.');
    }
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

  // Get the current HTML content of the editor
  getHtmlContent() {
    alert(this.editorContent);
    this.htmlContent = this.editorContent;
  }

  // Remove the currently selected row from the table
  removeRow() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const table = this.findAncestor(range.startContainer, 'table');
      if (table) {
        const row = this.findAncestor(range.startContainer, 'tr');
        if (row) {
          row.remove();
        }
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
}