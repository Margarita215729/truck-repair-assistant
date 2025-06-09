/**
 * AI Service Status Dashboard Component
 * 
 * Comprehensive health monitoring dashboard for all AI providers.
 * Features:
 * - Real-time health status for Azure OpenAI, Azure AI Foundry, and GitHub Models
 * - Performance metrics (latency, response times)
 * - Configuration status and availability checks
 * - Auto-refresh with configurable intervals
 * - Visual indicators and detailed error reporting
 * - Provider switching capabilities
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Activity,
  Zap,
  Settings,
  Wifi,
  WifiOff,
  TrendingUp,
  Shield
} from 'lucide-react'
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service'
import type { HealthStatus, AIServiceConfig } from '@/lib/ai/types'

interface ServiceMetrics {
  averageLatency: number
  successRate: number
  lastError?: string
  errorCount: number
  requestCount: number
}

interface ExtendedHealthStatus extends HealthStatus {
  lastChecked: Date
  metrics?: ServiceMetrics
  configStatus?: {
    available: boolean
    endpoint?: string
    agentId?: string
    threadId?: string
  }
}

const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
const METRICS_RETENTION_COUNT = 20 // Keep last 20 measurements

export default function AIServiceStatus() {
  const [healthStatuses, setHealthStatuses] = useState<ExtendedHealthStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [config, setConfig] = useState<AIServiceConfig | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [metricsHistory, setMetricsHistory] = useState<Map<string, ServiceMetrics[]>>(new Map())

  // Memoized health check function
  const performHealthCheck = useCallback(async (): Promise<ExtendedHealthStatus[]> => {
    try {
      const basicHealthStatuses = await enhancedAIService.checkHealth()
      const foundryStatus = enhancedAIService.getFoundryStatus()
      const currentConfig = enhancedAIService.getConfig()
      
      setConfig(currentConfig)

      // Enhance health statuses with additional information
      const enhancedStatuses: ExtendedHealthStatus[] = basicHealthStatuses.map(status => {
        const enhanced: ExtendedHealthStatus = {
          ...status,
          lastChecked: new Date()
        }

        // Add Azure AI Foundry configuration status
        if (status.service === 'azure-ai-foundry') {
          enhanced.configStatus = foundryStatus
        }

        // Add metrics from history
        const serviceMetrics = metricsHistory.get(status.service)
        if (serviceMetrics && serviceMetrics.length > 0) {
          const latest = serviceMetrics[serviceMetrics.length - 1]
          enhanced.metrics = latest
        }

        return enhanced
      })

      // Update metrics history
      setMetricsHistory(prev => {
        const newHistory = new Map(prev)
        enhancedStatuses.forEach(status => {
          const serviceHistory = newHistory.get(status.service) || []
          const newMetric: ServiceMetrics = {
            averageLatency: status.latency || 0,
            successRate: status.isHealthy ? 100 : 0,
            lastError: status.error,
            errorCount: status.error ? (serviceHistory[serviceHistory.length - 1]?.errorCount || 0) + 1 : 0,
            requestCount: (serviceHistory[serviceHistory.length - 1]?.requestCount || 0) + 1
          }
          
          serviceHistory.push(newMetric)
          if (serviceHistory.length > METRICS_RETENTION_COUNT) {
            serviceHistory.shift()
          }
          
          newHistory.set(status.service, serviceHistory)
        })
        return newHistory
      })

      return enhancedStatuses
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  }, [metricsHistory])

  // Initial health check and setup auto-refresh
  useEffect(() => {
    const runHealthCheck = async () => {
      setIsLoading(true)
      try {
        const statuses = await performHealthCheck()
        setHealthStatuses(statuses)
        setLastRefresh(new Date())
      } catch (error) {
        console.error('Failed to perform health check:', error)
      } finally {
        setIsLoading(false)
      }
    }

    runHealthCheck()

    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(runHealthCheck, HEALTH_CHECK_INTERVAL)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [performHealthCheck, autoRefresh])

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const statuses = await performHealthCheck()
      setHealthStatuses(statuses)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Manual refresh failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [performHealthCheck])

  // Provider switching functions
  const handleProviderSwitch = useCallback((provider: 'azure-openai' | 'github-models' | 'azure-ai-foundry') => {
    enhancedAIService.setPrimaryProvider(provider)
    setConfig(enhancedAIService.getConfig())
  }, [])

  const toggleFallback = useCallback(() => {
    const currentConfig = enhancedAIService.getConfig()
    enhancedAIService.setFallbackEnabled(!currentConfig.fallbackEnabled)
    setConfig(enhancedAIService.getConfig())
  }, [])

  // Computed metrics
  const overallHealth = useMemo(() => {
    if (healthStatuses.length === 0) return 'unknown'
    const healthyCount = healthStatuses.filter(s => s.isHealthy).length
    if (healthyCount === healthStatuses.length) return 'healthy'
    if (healthyCount > 0) return 'partial'
    return 'unhealthy'
  }, [healthStatuses])

  const averageLatency = useMemo(() => {
    const latencies = healthStatuses
      .filter(s => s.isHealthy && s.latency)
      .map(s => s.latency!)
    return latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0
  }, [healthStatuses])

  // Status badge component
  const StatusBadge = ({ status }: { status: ExtendedHealthStatus }) => {
    const variant = status.isHealthy ? 'default' : 'destructive'
    const icon = status.isHealthy ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status.isHealthy ? 'Healthy' : 'Unhealthy'}
      </Badge>
    )
  }

  // Service card component
  const ServiceCard = ({ status }: { status: ExtendedHealthStatus }) => {
    const serviceLabels = {
      'azure-openai': 'Azure OpenAI',
      'azure-ai-foundry': 'Azure AI Foundry',
      'github-models': 'GitHub Models'
    }

    const isPrimary = config?.primaryProvider === status.service
    
    return (
      <Card className={`transition-all duration-200 ${isPrimary ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {serviceLabels[status.service]}
              {isPrimary && <Badge variant="outline" className="text-xs">Primary</Badge>}
            </CardTitle>
            <StatusBadge status={status} />
          </div>
          <CardDescription className="text-xs">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Latency */}
          {status.latency && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Latency
              </span>
              <span className="font-mono text-xs">
                {status.latency}ms
              </span>
            </div>
          )}

          {/* Configuration Status for Azure AI Foundry */}
          {status.service === 'azure-ai-foundry' && status.configStatus && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Settings className="w-3 h-3" />
                Configuration
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className={status.configStatus.available ? 'text-green-600' : 'text-red-600'}>
                    {status.configStatus.available ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Endpoint:</span>
                  <span className={status.configStatus.endpoint !== 'missing' ? 'text-green-600' : 'text-red-600'}>
                    {status.configStatus.endpoint !== 'missing' ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Agent ID:</span>
                  <span className={status.configStatus.agentId !== 'missing' ? 'text-green-600' : 'text-red-600'}>
                    {status.configStatus.agentId !== 'missing' ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Metrics */}
          {status.metrics && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <TrendingUp className="w-3 h-3" />
                Metrics
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Success Rate:</span>
                  <span className="font-mono">{status.metrics.successRate.toFixed(1)}%</span>
                </div>
                <Progress value={status.metrics.successRate} className="h-1" />
                {status.metrics.errorCount > 0 && (
                  <div className="flex justify-between text-xs text-red-600">
                    <span>Errors:</span>
                    <span className="font-mono">{status.metrics.errorCount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {status.error && (
            <Alert className="p-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {status.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Provider Actions */}
          <div className="flex gap-2">
            {!isPrimary && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleProviderSwitch(status.service)}
                className="text-xs h-7"
              >
                Make Primary
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            AI Service Status
          </h2>
          <p className="text-gray-600 text-sm">
            Monitor and manage AI provider health and performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            {autoRefresh ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {overallHealth === 'healthy' && <span className="text-green-600">Healthy</span>}
                {overallHealth === 'partial' && <span className="text-yellow-600">Partial</span>}
                {overallHealth === 'unhealthy' && <span className="text-red-600">Unhealthy</span>}
                {overallHealth === 'unknown' && <span className="text-gray-600">Unknown</span>}
              </div>
              <div className="text-xs text-gray-600">Overall Status</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{healthStatuses.filter(s => s.isHealthy).length}</div>
              <div className="text-xs text-gray-600">Healthy Services</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{averageLatency}ms</div>
              <div className="text-xs text-gray-600">Avg Latency</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{lastRefresh.toLocaleTimeString()}</div>
              <div className="text-xs text-gray-600">Last Updated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Panel */}
      {config && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Primary Provider</label>
                <div className="text-sm text-gray-600 capitalize">
                  {config.primaryProvider.replace('-', ' ')}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Fallback Enabled</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {config.fallbackEnabled ? 'Yes' : 'No'}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleFallback}
                    className="text-xs h-6"
                  >
                    Toggle
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Timeout</label>
                <div className="text-sm text-gray-600">
                  {config.timeout / 1000}s
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthStatuses.map((status) => (
          <ServiceCard key={status.service} status={status} />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && healthStatuses.length === 0 && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Checking AI service health...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && healthStatuses.length === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <p className="text-gray-600">No AI services configured or accessible</p>
        </div>
      )}
    </div>
  )
}
