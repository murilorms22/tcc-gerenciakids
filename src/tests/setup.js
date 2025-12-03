import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// limpa o ambiente após cada teste
afterEach(() => {
  cleanup()
})