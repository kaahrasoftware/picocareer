
import { Database } from './database.types'

type Tables = Database['public']['Tables']

export type AvailabilityRequest = {
  id: string
  mentor_id: string
  mentee_id: string
  created_at: string
  status: 'pending' | 'accepted' | 'rejected'
}

declare global {
  type TablesInsert = {
    [TableName in keyof Tables]: Tables[TableName]['Insert']
  }
  type TablesRow = {
    [TableName in keyof Tables]: Tables[TableName]['Row']
  }
  type TablesUpdate = {
    [TableName in keyof Tables]: Tables[TableName]['Update']
  }
}

// Add new table
export type DbTables = {
  availability_requests: AvailabilityRequest
} & Tables
