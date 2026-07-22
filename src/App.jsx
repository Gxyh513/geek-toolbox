import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Home from './tools/Home';
import PlaceholderTool from './tools/PlaceholderTool';

const toolComponents = {
  'curl-to-e': lazy(() => import('./tools/curl-to-e/CurlToETool')),
  'json-tree': lazy(() => import('./tools/json-tree/JsonTreeTool')),
  'encode-e': lazy(() => import('./tools/encode-e/EncodeETool')),
  'crypto-e': lazy(() => import('./tools/crypto-e/CryptoETool')),
  'timestamp-e': lazy(() => import('./tools/timestamp-e/TimestampETool')),
  'uuid-generator': lazy(() => import('./tools/uuid-generator/UuidGeneratorTool')),
  'password-generator': lazy(() => import('./tools/password-generator/PasswordGeneratorTool')),
  'regex-tester': lazy(() => import('./tools/regex-tester/RegexTesterTool')),
  'text-diff': lazy(() => import('./tools/text-diff/TextDiffTool')),
  'markdown-preview': lazy(() => import('./tools/markdown-preview/MarkdownPreviewTool')),
  'qrcode': lazy(() => import('./tools/qrcode/QRCodeTool')),
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ToolPage() {
  const { toolId } = useParams();
  const ToolComponent = toolComponents[toolId];
  if (!ToolComponent) {
    return <PlaceholderTool toolId={toolId} />;
  }
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ToolComponent />
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tool/:toolId" element={<ToolPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </BrowserRouter>
  );
}
