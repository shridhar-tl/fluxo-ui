import React from 'react';
import { FileUpload } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const customValidator = (file: File): string | undefined => {
    if (file.name.includes(' ')) {
        return 'File name must not contain spaces';
    }
    return undefined;
};

const code = `import { FileUpload } from 'fluxo-ui';

<FileUpload
  accept=".pdf,.doc,.docx"
  multiple
  maxFileSize={2 * 1024 * 1024}
  maxFiles={3}
  customValidator={(file) => {
    if (file.name.includes(' ')) {
      return 'File name must not contain spaces';
    }
    return undefined;
  }}
  onFilesSelect={(files) => console.log('Valid files:', files)}
/>`;

const Validation: React.FC = () => (
    <>
        <ComponentDemo
            title="File Validation"
            description="Restrict file types, enforce size limits, and add custom validation rules. Invalid files display inline error messages."
        >
            <div className="w-full max-w-lg">
                <FileUpload
                    accept=".pdf,.doc,.docx"
                    multiple
                    maxFileSize={2 * 1024 * 1024}
                    maxFiles={3}
                    showPreview
                    customValidator={customValidator}
                    onFilesSelect={(files) => console.log('Valid files:', files)}
                />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Validation;
