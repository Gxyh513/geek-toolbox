import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Home from './tools/Home';
import PlaceholderTool from './tools/PlaceholderTool';

const toolComponents = {
  'base64': lazy(() => import('./tools/base64/Base64Tool')),
  'url-encode': lazy(() => import('./tools/url-encode/UrlEncodeTool')),
  'json-formatter': lazy(() => import('./tools/json-formatter/JsonFormatterTool')),
  'jwt-parser': lazy(() => import('./tools/jwt-parser/JwtParserTool')),
  'unicode': lazy(() => import('./tools/unicode/UnicodeTool')),
  'hash': lazy(() => import('./tools/hash/HashTool')),
  'hmac': lazy(() => import('./tools/hmac/HmacTool')),
  'uuid-generator': lazy(() => import('./tools/uuid-generator/UuidGeneratorTool')),
  'password-generator': lazy(() => import('./tools/password-generator/PasswordGeneratorTool')),
  'regex-tester': lazy(() => import('./tools/regex-tester/RegexTesterTool')),
  'text-diff': lazy(() => import('./tools/text-diff/TextDiffTool')),
  'case-converter': lazy(() => import('./tools/case-converter/CaseConverterTool')),
  'markdown-preview': lazy(() => import('./tools/markdown-preview/MarkdownPreviewTool')),
  'timestamp': lazy(() => import('./tools/timestamp/TimestampTool')),
  'cron-parser': lazy(() => import('./tools/cron-parser/CronParserTool')),
  'timezone': lazy(() => import('./tools/timezone/TimezoneTool')),
  'color-picker': lazy(() => import('./tools/color-picker/ColorPickerTool')),
  'gradient-generator': lazy(() => import('./tools/gradient-generator/GradientGeneratorTool')),
  'regex-visualizer': lazy(() => import('./tools/regex-visualizer/RegexVisualizerTool')),
  'qrcode': lazy(() => import('./tools/qrcode/QRCodeTool')),
  'ip-lookup': lazy(() => import('./tools/ip-lookup/IpLookupTool')),
  'ua-parser': lazy(() => import('./tools/ua-parser/UaParserTool')),
  'dns-lookup': lazy(() => import('./tools/dns-lookup/DnsLookupTool')),
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
