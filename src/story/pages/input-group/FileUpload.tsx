import React from 'react';
import { Button, InputGroup, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const FileUpload: React.FC = () => {
    return (
        <ComponentDemo title="File Upload" description="File input with upload button">
            <div className="w-full max-w-96">
                <InputGroup>
                    <TextInput placeholder="Choose file..." readonly />
                    <Button layout="outlined">Browse</Button>
                    <Button>Upload</Button>
                </InputGroup>
            </div>
        </ComponentDemo>
    );
};

export default FileUpload;
