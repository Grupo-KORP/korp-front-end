import { useMemo } from 'react'
import { entityMap } from '../config/entities'
import { entityServices } from '../services/entityServices'

export function useCrudEntity(entityKey) {
  const entity = useMemo(() => entityMap[entityKey], [entityKey])
  const service = useMemo(() => entityServices[entityKey], [entityKey])

  return { entity, service }
}
