'use client';

import React from 'react';
import { StreamingSetup } from '@/components/StreamingSetup';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StreamingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Tournament</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Streaming Setup</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            CBL Tournament Streaming Setup
          </h2>
          <p className="text-gray-600">
            Generate properly formatted YouTube titles, descriptions, and tags for tournament matches.
            Select a match below to get started.
          </p>
        </div>

        <StreamingSetup />
      </div>
    </div>
  );
}