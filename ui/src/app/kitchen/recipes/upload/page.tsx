"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconRenderer } from "@/components/ui/IconRenderer";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
type UploadResult = {
  success: number;
  failed: number;
  errors: string[];
  recipes: any[];
};

type RecipeUpload = {
  product_id: string;
  name: string;
  instructions: string;
  is_active: boolean;
  ingredients: {
    stock_item_id: string;
    quantity: string;
    unit: string;
  }[];
};

// ─── API Functions ────────────────────────────────────────────────────────────
async function uploadRecipes(recipes: RecipeUpload[]): Promise<UploadResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  const results: UploadResult = {
    success: 0,
    failed: 0,
    errors: [],
    recipes: [],
  };

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    try {
      const res = await fetch(`${baseUrl}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(recipe),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `Failed to create recipe: ${res.status}`);
      }

      const created = await res.json();
      results.recipes.push(created);
      results.success++;
    } catch (e) {
      results.failed++;
      results.errors.push(`Recipe ${i + 1} (${recipe.name}): ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  return results;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UploadRecipesPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<RecipeUpload[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setPreviewData(null);
      
      // Auto-preview for JSON files
      if (selectedFile.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            setPreviewData(Array.isArray(data) ? data : [data]);
          } catch (e) {
            setError('Invalid JSON file format');
          }
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          let recipes: RecipeUpload[];

          if (file.name.endsWith('.json')) {
            const data = JSON.parse(content);
            recipes = Array.isArray(data) ? data : [data];
          } else if (file.name.endsWith('.csv')) {
            // Parse CSV
            const lines = content.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim());
            
            recipes = [];
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.trim());
              const recipe: any = {};
              headers.forEach((header, index) => {
                recipe[header] = values[index];
              });
              
              // Parse ingredients (assuming they're in JSON format in CSV)
              if (recipe.ingredients) {
                try {
                  recipe.ingredients = JSON.parse(recipe.ingredients);
                } catch {
                  recipe.ingredients = [];
                }
              }
              
              recipes.push(recipe);
            }
          } else {
            throw new Error('Unsupported file format. Please use JSON or CSV.');
          }

          // Validate recipes
          for (let i = 0; i < recipes.length; i++) {
            const recipe = recipes[i];
            if (!recipe.product_id) throw new Error(`Recipe ${i + 1}: Missing product_id`);
            if (!recipe.name) throw new Error(`Recipe ${i + 1}: Missing name`);
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
              throw new Error(`Recipe ${i + 1}: Missing or invalid ingredients`);
            }
          }

          // Upload recipes
          const uploadResult = await uploadRecipes(recipes);
          setResult(uploadResult);

          if (uploadResult.success > 0 && uploadResult.failed === 0) {
            // All successful - redirect after 3 seconds
            setTimeout(() => {
              router.push('/kitchen/recipes');
            }, 3000);
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to process file');
        } finally {
          setUploading(false);
        }
      };

      reader.readAsText(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload recipes');
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        product_id: "1",
        name: "Example Recipe Name",
        instructions: "1. Step one\n2. Step two\n3. Step three",
        is_active: true,
        ingredients: [
          {
            stock_item_id: "10",
            quantity: "1.5",
            unit: "kg"
          },
          {
            stock_item_id: "11",
            quantity: "0.5",
            unit: "liters"
          }
        ]
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipe-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/kitchen/recipes"
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <svg className="w-6 h-6 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
              <IconRenderer icon="document" className="h-10 w-10 text-zinc-700 dark:text-zinc-200" />
              Upload Recipes
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Upload multiple recipes at once using JSON or CSV files
            </p>
          </div>
        </div>

        {/* Template Download */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">Need a template?</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Download our JSON template to see the correct format for bulk recipe uploads.
              </p>
              <button
                onClick={downloadTemplate}
                className="mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Upload File</h2>
          
          <div className="space-y-4">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Select File (JSON or CSV)
              </label>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 dark:file:bg-orange-900 dark:file:text-orange-100"
              />
              {file && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Recipes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        {previewData && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Preview</h2>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Found {previewData.length} recipe{previewData.length !== 1 ? 's' : ''} to upload
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {previewData.slice(0, 5).map((recipe, index) => (
                <div key={index} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">{recipe.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
              {previewData.length > 5 && (
                <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                  ...and {previewData.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-100">Upload Error</p>
                <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Result Message */}
        {result && (
          <div className={`rounded-xl border p-4 ${
            result.failed === 0
              ? 'border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20'
              : 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20'
          }`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                result.failed === 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className={`font-medium ${
                  result.failed === 0
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-amber-900 dark:text-amber-100'
                }`}>
                  Upload Complete
                </p>
                <div className={`text-sm mt-1 ${
                  result.failed === 0
                    ? 'text-green-700 dark:text-green-200'
                    : 'text-amber-700 dark:text-amber-200'
                }`}>
                  <p>{result.success} recipe{result.success !== 1 ? 's' : ''} uploaded successfully</p>
                  {result.failed > 0 && (
                    <p>{result.failed} recipe{result.failed !== 1 ? 's' : ''} failed</p>
                  )}
                  {result.failed === 0 && (
                    <p className="mt-2 font-medium">Redirecting to recipes list...</p>
                  )}
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">Errors:</p>
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-xs text-amber-700 dark:text-amber-200">• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">File Format Instructions</h2>
          
          <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">JSON Format:</h3>
              <pre className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-x-auto text-xs">
{`[
  {
    "product_id": "1",
    "name": "Recipe Name",
    "instructions": "Step-by-step instructions",
    "is_active": true,
    "ingredients": [
      {
        "stock_item_id": "10",
        "quantity": "1.5",
        "unit": "kg"
      }
    ]
  }
]`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Required Fields:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">product_id</code> - ID of the product this recipe creates</li>
                <li><code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">name</code> - Recipe name</li>
                <li><code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">ingredients</code> - Array of ingredients (at least 1)</li>
                <li><code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">stock_item_id</code> - ID of the ingredient stock item</li>
                <li><code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">quantity</code> - Amount needed (decimal)</li>
                <li><code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">unit</code> - Measurement unit (kg, liters, etc.)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Tips:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Download the template to see the correct format</li>
                <li>Use valid product IDs and stock item IDs from your database</li>
                <li>Each recipe will be validated before upload</li>
                <li>Failed recipes will show error messages</li>
                <li>Successfully uploaded recipes will appear in the list</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
