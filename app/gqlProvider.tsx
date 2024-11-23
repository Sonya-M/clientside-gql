'use client'

import {
  UrqlProvider,
  ssrExchange,
  fetchExchange,
  createClient,
  gql,
} from '@urql/next'
import { useMemo, PropsWithChildren, cache } from 'react'
import { cacheExchange } from '@urql/exchange-graphcache'
import { url } from '@/utils/url'
import { getToken } from '@/utils/token'

export default function GQLProvider({ children }: PropsWithChildren) {
  // need to keep same client for the app to keep same cache etc.
  // (vs server side  where we create a new client for each request)
  const [client, ssr] = useMemo(() => {
    // apollo calls exchange a link??? - just a plugin
    const ssr = ssrExchange({
      isClient: typeof window !== 'undefined',
    })
    const client = createClient({
      url,
      exchanges: [cacheExchange({}), ssr, fetchExchange],
      fetchOptions: () => {
        const token = getToken()
        return token
          ? {
              headers: { authorization: `Bearer ${token}` },
            }
          : {}
      },
    })
    return [client, ssr]
  }, [])

  return (
    <UrqlProvider client={client} ssr={ssr}>
      {children}
    </UrqlProvider>
  )
}
