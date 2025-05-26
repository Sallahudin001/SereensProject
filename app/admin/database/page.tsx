"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, CheckCircle, Database, AlertCircle, Loader2 } from "lucide-react";

export default function DatabaseAdminPage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [migrationResult, setMigrationResult] = useState<any>(null);
  
  // Function to check database connection
  const checkConnection = async () => {
    setConnectionStatus('checking');
    setConnectionDetails(null);
    
    try {
      const response = await fetch('/api/financing/db-check');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
      
      setConnectionDetails(data);
      
    } catch (error) {
      console.error("Error checking database connection:", error);
      setConnectionStatus('error');
      setConnectionDetails({ error: String(error) });
    }
  };
  
  // Function to run the migration
  const runMigration = async () => {
    setMigrationStatus('running');
    setMigrationResult(null);
    
    try {
      const response = await fetch('/api/financing/check-and-apply');
      const data = await response.json();
      
      if (data.success) {
        setMigrationStatus('success');
      } else {
        setMigrationStatus('error');
      }
      
      setMigrationResult(data);
      
    } catch (error) {
      console.error("Error running migration:", error);
      setMigrationStatus('error');
      setMigrationResult({ error: String(error) });
    }
  };
  
  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Database Administration</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Connection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Connection
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {connectionStatus === 'idle' && (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Check your database connection status</p>
              </div>
            )}
            
            {connectionStatus === 'checking' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Checking connection...</span>
              </div>
            )}
            
            {connectionStatus === 'success' && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Connection Successful</AlertTitle>
                <AlertDescription className="text-green-700">
                  <div className="mt-2">
                    <p><strong>Timestamp:</strong> {connectionDetails?.timestamp}</p>
                    
                    {connectionDetails?.tables && (
                      <div className="mt-2">
                        <p className="font-medium">Tables:</p>
                        <ul className="list-disc list-inside mt-1">
                          <li>Proposals: {connectionDetails.tables.proposals ? 'Exists' : 'Missing'}</li>
                          <li>Financing Plans: {connectionDetails.tables.financing_plans ? 'Exists' : 'Missing'}</li>
                        </ul>
                      </div>
                    )}
                    
                    {connectionDetails?.financingPlansCount !== undefined && (
                      <p className="mt-2"><strong>Financing Plans:</strong> {connectionDetails.financingPlansCount} records</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>
                  {connectionDetails?.error || 'Could not connect to the database.'}
                  
                  {connectionDetails?.details && (
                    <div className="mt-2 text-sm bg-red-50 p-2 rounded overflow-auto max-h-32">
                      {connectionDetails.details}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={checkConnection}
              disabled={connectionStatus === 'checking'}
              className="w-full"
            >
              {connectionStatus === 'checking' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Check Connection
            </Button>
          </CardFooter>
        </Card>
        
        {/* Database Migration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Run Financing Migration
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {migrationStatus === 'idle' && (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  Add financing columns to the proposals table
                </p>
              </div>
            )}
            
            {migrationStatus === 'running' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Running migration...</span>
              </div>
            )}
            
            {migrationStatus === 'success' && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Migration Successful</AlertTitle>
                <AlertDescription className="text-green-700">
                  <p>{migrationResult?.message || 'Migration completed successfully.'}</p>
                  
                  {migrationResult?.columnExists && (
                    <p className="mt-2">The required columns already exist in the database.</p>
                  )}
                  
                  {migrationResult?.results && (
                    <div className="mt-2">
                      <p className="font-medium">Results:</p>
                      <ul className="list-disc list-inside mt-1">
                        {migrationResult.results.map((result: any, index: number) => (
                          <li key={index} className={result.success ? 'text-green-700' : 'text-red-700'}>
                            {result.column}: {result.success ? 'Success' : 'Failed'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {migrationStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Migration Failed</AlertTitle>
                <AlertDescription>
                  {migrationResult?.error || 'Could not run the migration.'}
                  
                  {migrationResult?.details && (
                    <div className="mt-2 text-sm bg-red-50 p-2 rounded overflow-auto max-h-32">
                      {migrationResult.details}
                    </div>
                  )}
                  
                  {migrationResult?.failures && migrationResult.failures.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Failed operations:</p>
                      <ul className="list-disc list-inside mt-1">
                        {migrationResult.failures.map((failure: any, index: number) => (
                          <li key={index}>
                            {failure.column}: {failure.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={runMigration}
              disabled={migrationStatus === 'running'}
              className="w-full"
            >
              {migrationStatus === 'running' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Run Migration
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 