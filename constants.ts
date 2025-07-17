
import type { Problem } from './types';

export const PROBLEMS: Problem[] = [
  {
    id: 'rate-limiter',
    title: 'Implement a Rate Limiter',
    description: 'Build a thread-safe rate limiter using the Token Bucket algorithm. It should have a configurable bucket size and refill rate.',
    skeletonCode: `package main

import (
	"fmt"
	"sync"
	"time"
)

// RateLimiter defines the interface for a rate limiter.
type RateLimiter interface {
	// Allow checks if a request is allowed.
	Allow() bool
}

// TokenBucket represents a token bucket rate limiter.
type TokenBucket struct {
	// Add your fields here
	// Consider: capacity, tokens, refillRate, lastRefillTime, mutex
}

// NewTokenBucket creates a new TokenBucket rate limiter.
func NewTokenBucket(capacity int, refillRate time.Duration) *TokenBucket {
	// Implement the constructor
	return &TokenBucket{}
}

// Allow implements the RateLimiter interface.
func (tb *TokenBucket) Allow() bool {
	// Implement the token bucket logic here
	// 1. Refill tokens based on elapsed time
	// 2. Check if a token is available
	// 3. Consume a token if available
	return false
}

func main() {
	// Example usage:
	// Create a rate limiter that allows 10 requests per second, with a bucket size of 10.
	limiter := NewTokenBucket(10, time.Second/10)

	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func(reqNum int) {
			defer wg.Done()
			if limiter.Allow() {
				fmt.Printf("Request %d: Allowed\\n", reqNum)
			} else {
				fmt.Printf("Request %d: Denied\\n", reqNum)
			}
		}(i)
		time.Sleep(50 * time.Millisecond)
	}
	wg.Wait()
}
`,
  },
  {
    id: 'in-memory-kv',
    title: 'In-Memory Key-Value Store',
    description: 'Create a thread-safe in-memory key-value store that supports Get, Set, and Delete operations. The store should also support setting a Time-To-Live (TTL) on keys.',
    skeletonCode: `package main

import (
	"fmt"
	"sync"
	"time"
)

// KVStore defines the interface for a key-value store.
type KVStore interface {
	Set(key string, value interface{}, ttl time.Duration)
	Get(key string) (interface{}, bool)
	Delete(key string)
}

type storeItem struct {
	value      interface{}
	expiry     int64 // UnixNano timestamp
	hasExpiry  bool
}

// InMemoryKVStore is a thread-safe in-memory key-value store.
type InMemoryKVStore struct {
	data map[string]storeItem
	mu   sync.RWMutex
}

// NewInMemoryKVStore creates a new InMemoryKVStore.
func NewInMemoryKVStore() *InMemoryKVStore {
	store := &InMemoryKVStore{
		data: make(map[string]storeItem),
	}
	// Optional: Start a background goroutine to clean up expired keys
	// go store.cleanupExpiredKeys()
	return store
}

// Set adds or updates a key-value pair with an optional TTL.
func (s *InMemoryKVStore) Set(key string, value interface{}, ttl time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()
	// Implement the Set logic here
}

// Get retrieves a value for a given key.
func (s *InMemoryKVStore) Get(key string) (interface{}, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	// Implement the Get logic here, including checking for expiry
	return nil, false
}

// Delete removes a key from the store.
func (s *InMemoryKVStore) Delete(key string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	// Implement the Delete logic here
}

func main() {
	store := NewInMemoryKVStore()

	fmt.Println("Setting 'name' to 'Alice' with no TTL")
	store.Set("name", "Alice", 0)

	fmt.Println("Setting 'temp_key' to 'will expire' with 2s TTL")
	store.Set("temp_key", "will expire", 2*time.Second)

	val, ok := store.Get("name")
	fmt.Printf("Get 'name': %v, %t\\n", val, ok)

	val, ok = store.Get("temp_key")
	fmt.Printf("Get 'temp_key' (before expiry): %v, %t\\n", val, ok)

	fmt.Println("Sleeping for 3 seconds...")
	time.Sleep(3 * time.Second)

	val, ok = store.Get("temp_key")
	fmt.Printf("Get 'temp_key' (after expiry): %v, %t\\n", val, ok)
}
`,
  },
  {
    id: 'concurrent-crawler',
    title: 'Concurrent Web Crawler',
    description: 'Build a concurrent web crawler that fetches URLs, parses them for new links, and crawls them, avoiding duplicate URLs. Use channels and goroutines to manage concurrency.',
    skeletonCode: `package main

import (
	"fmt"
	"sync"
)

// Fetcher is an interface for fetching URLs.
// For this problem, we will use a mock implementation.
type Fetcher interface {
	Fetch(url string) (body string, urls []string, err error)
}

// Crawl uses a Fetcher to recursively crawl pages starting with url,
// to a maximum depth.
func Crawl(url string, depth int, fetcher Fetcher) {
	// TODO: Fetch URLs in parallel.
	// TODO: Don't fetch the same URL twice.
	// This implementation should be concurrent.
	
	// A map to keep track of visited URLs might be useful.
	// A channel to coordinate work between goroutines is a good approach.
	
	fmt.Println("Implement me!")
}

func main() {
	Crawl("https://golang.org/", 4, fetcher)
}

// --- Mock Fetcher ---

type fakeFetcher map[string]*fakeResult

type fakeResult struct {
	body string
	urls []string
}

func (f fakeFetcher) Fetch(url string) (string, []string, error) {
	if res, ok := f[url]; ok {
		return res.body, res.urls, nil
	}
	return "", nil, fmt.Errorf("not found: %s", url)
}

// fetcher is a populated fakeFetcher.
var fetcher = fakeFetcher{
	"https://golang.org/": &fakeResult{
		"The Go Programming Language",
		[]string{
			"https://golang.org/pkg/",
			"https://golang.org/cmd/",
		},
	},
	"https://golang.org/pkg/": &fakeResult{
		"Packages",
		[]string{
			"https://golang.org/",
			"https://golang.org/cmd/",
			"https://golang.org/pkg/fmt/",
			"https://golang.org/pkg/os/",
		},
	},
	"https://golang.org/pkg/fmt/": &fakeResult{
		"Package fmt",
		[]string{
			"https://golang.org/",
			"https://golang.org/pkg/",
		},
	},
	"https://golang.org/pkg/os/": &fakeResult{
		"Package os",
		[]string{
			"https://golang.org/",
			"https://golang.org/pkg/",
		},
	},
}
`,
  },
];