
import type { Problem } from './types';

export const PROBLEMS: Problem[] = [
    {
    id: 'worker-pool',
    title: 'Concurrent Worker Pool',
    description: 'Design and implement a worker pool in Go that can process a large number of jobs concurrently. The system should accept new jobs, process them with a fixed number of worker goroutines, collect the results, and allow for a graceful shutdown of the pool.',
    skeletonCode: `package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

// Job represents a unit of work
type Job struct {
	ID   int
	Data interface{}
}

// Result represents the result of a job
type Result struct {
	JobID int
	Data  interface{}
	Error error
}

// WorkerPool represents a pool of workers
type WorkerPool struct {
	// TODO: Add necessary fields
	// workers, jobChan, resultChan, ctx, cancel, wg, etc.
}

// NewWorkerPool creates a new worker pool
func NewWorkerPool(numWorkers int, maxJobsPerSec int) *WorkerPool {
    // TODO: Implement constructor
    return &WorkerPool{}
}

// Start begins the worker pool processing
func (wp *WorkerPool) Start() {
    // TODO: Implement Start
}

// Submit sends a job to the pool
func (wp *WorkerPool) Submit(job Job) {
    // TODO: Implement Submit
}

// Stop gracefully shuts down the worker pool
func (wp *WorkerPool) Stop() {
    // TODO: Implement Stop
}

func main() {
    // Example usage
    pool := NewWorkerPool(5, 10)
    pool.Start()

    // Submit jobs
    for i := 1; i <= 20; i++ {
        job := Job{ID: i}
        pool.Submit(job)
    }

    // Handle results (in a separate goroutine)
    go func() {
        // ... logic to read from result channel
    }()

    time.Sleep(3 * time.Second) // allow some jobs to process
    pool.Stop()
    fmt.Println("Worker pool stopped.")
}
`,
    tags: {
      level: 'Hard',
      concept: 'Concurrency',
      label: 'Hard'
    },
    requirements: [
      'Create a worker pool with a configurable number of workers',
      'Implement job queuing with channel-based communication',
      'Add rate limiting (max jobs per second)',
      'Support graceful shutdown with context cancellation',
      'Handle worker panics without crashing the pool',
      'Provide job status tracking and metrics',
    ],
    example: {
      input: 'NewWorkerPool(5, 10) // 5 workers, 10 jobs/sec limit',
      output: 'WorkerPool instance with 5 workers and rate limiting',
      explanation: 'Creates a pool that can process up to 10 jobs per second using 5 concurrent workers.',
    },
    hints: [
      'Use channels for job distribution and result collection.',
      'Implement rate limiting with time.Ticker.',
      'Use a sync.WaitGroup to wait for all workers to finish during shutdown.',
      'Use context.Context for managing cancellation across goroutines.',
    ],
  },
  {
    id: 'rate-limiter',
    title: 'Token Bucket Rate Limiter',
    description: 'Build a thread-safe rate limiter using the Token Bucket algorithm. It should have a configurable bucket size and refill rate.',
    skeletonCode: `package main

import (
	"fmt"
	"sync"
	"time"
)

type RateLimiter interface {
	Allow() bool
}

type TokenBucket struct {
	capacity     int
	tokens       int
	refillRate   time.Duration
	lastRefill   time.Time
	mu           sync.Mutex
}

func NewTokenBucket(capacity int, refillRate time.Duration) *TokenBucket {
	return &TokenBucket{
		capacity:   capacity,
		tokens:     capacity,
		refillRate: refillRate,
		lastRefill: time.Now(),
	}
}

func (tb *TokenBucket) refill() {
    // Implement refill logic
}

func (tb *TokenBucket) Allow() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()
    // Implement token checking and consumption logic
	return false
}

func main() {
	limiter := NewTokenBucket(10, time.Second/10) // 10 tokens, 10 refills/sec

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
		time.Sleep(50 * time.Millisecond) // 20 reqs/sec > 10 allowed
	}
	wg.Wait()
}
`,
     tags: {
      level: 'Medium',
      concept: 'Concurrency',
      label: 'Medium'
    },
    requirements: [
        'Implement a TokenBucket struct.',
        'The struct should be safe for concurrent use.',
        'Allow method should return true if a request can proceed, false otherwise.',
        'Tokens should be refilled based on a specified rate.',
    ],
    example: {
      input: 'NewTokenBucket(10, time.Second/10)',
      output: 'A rate limiter allowing ~10 requests per second with a burst of 10.',
      explanation: 'Initializes a token bucket with a capacity of 10 tokens that are refilled at a rate of 1 token every 100ms.',
    },
    hints: [
      'Use a mutex to protect access to the token count and last refill timestamp.',
      'Calculate tokens to add based on time elapsed since the last refill.',
      'Ensure the token count does not exceed the bucket capacity.',
    ],
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

type KVStore interface {
	Set(key string, value interface{}, ttl time.Duration)
	Get(key string) (interface{}, bool)
	Delete(key string)
}

type storeItem struct {
	value      interface{}
	expiry     int64
}

type InMemoryKVStore struct {
	data map[string]storeItem
	mu   sync.RWMutex
}

func NewInMemoryKVStore() *InMemoryKVStore {
	store := &InMemoryKVStore{
		data: make(map[string]storeItem),
	}
	// go store.cleanup() // Optional: background cleanup goroutine
	return store
}

func (s *InMemoryKVStore) Set(key string, value interface{}, ttl time.Duration) {
	// Implement Set logic
}

func (s *InMemoryKVStore) Get(key string) (interface{}, bool) {
	// Implement Get logic, check for expiry
	return nil, false
}

func (s *InMemoryKVStore) Delete(key string) {
	// Implement Delete logic
}

func main() {
	store := NewInMemoryKVStore()
	store.Set("name", "Alice", 0)
	store.Set("temp", "data", 2*time.Second)
	
	val, _ := store.Get("name")
	fmt.Printf("Got name: %v\\n", val)

	time.Sleep(3 * time.Second)
	
	val, ok := store.Get("temp")
	fmt.Printf("Got temp after 3s: %v, (found: %t)\\n", val, ok)
}
`,
     tags: {
      level: 'Medium',
      concept: 'Data Structures',
      label: 'Medium'
    },
    requirements: [
        'Provide Get, Set, and Delete operations.',
        'All operations must be thread-safe.',
        'Support optional TTL (Time-To-Live) for each key.',
        'Expired keys should not be returned by Get.',
    ],
    example: {
      input: `store.Set("key", "value", 5*time.Second)`,
      output: `Get("key") returns "value" now, but nothing after 5 seconds.`,
      explanation: 'The key "key" is stored with a TTL. It automatically becomes inaccessible after the duration has passed.',
    },
    hints: [
      'Use a `sync.RWMutex` to allow concurrent reads.',
      'Store the expiry time (e.g., as a Unix timestamp) along with the value.',
      'When getting a key, check if it has expired before returning it.',
      'Consider a background goroutine to periodically clean up expired keys to save memory.',
    ],
  },
  {
    id: 'transactional-kv-store',
    title: 'Transactional Key-Value Store',
    description: 'Design and implement a key-value store that supports transactions. It should provide basic Get, Put, and Delete operations, along with StartTransaction, Commit, and Abort functionalities to manage transactional states.',
    skeletonCode: `package main

import (
	"fmt"
	"sync"
)

// TransactionalKVStore defines the interface for our store.
type TransactionalKVStore interface {
	Get(key string) (string, bool)
	Put(key, value string)
	Delete(key string)
	
	StartTransaction() error
	Commit() error
	Abort() error
}

// store implements the TransactionalKVStore interface.
type store struct {
	mu           sync.RWMutex
	data         map[string]string
	inTransaction bool
	pendingData  map[string]*string // Using *string to differentiate between setting a key to "" and deleting it (nil)
}

// NewStore creates a new TransactionalKVStore.
func NewStore() TransactionalKVStore {
	return &store{
		data: make(map[string]string),
	}
}

func (s *store) Get(key string) (string, bool) {
	// TODO: Implement Get. Should read from pendingData if in a transaction.
	return "", false
}

func (s *store) Put(key, value string) {
	// TODO: Implement Put. Should write to pendingData if in a transaction.
}

func (s *store) Delete(key string) {
	// TODO: Implement Delete. Should mark for deletion in pendingData if in a transaction.
}

func (s *store) StartTransaction() error {
	// TODO: Implement StartTransaction. Should fail if a transaction is already in progress.
	return nil
}

func (s *store) Commit() error {
	// TODO: Implement Commit. Should merge pendingData into data.
	return nil
}

func (s *store) Abort() error {
	// TODO: Implement Abort. Should discard pendingData.
	return nil
}

func main() {
	s := NewStore()
	
	s.Put("k1", "v1")
	fmt.Println("Initial Get(\\"k1\\"):")
	val, _ := s.Get("k1"); fmt.Println(val) // Expected: v1

	fmt.Println("\\n--- Transaction 1 (Abort) ---")
	s.StartTransaction()
	val, _ = s.Get("k1"); fmt.Printf("Get(\\"k1\\") inside transaction: %s\\n", val) // Expected: v1
	s.Put("k1", "v2")
	val, _ = s.Get("k1"); fmt.Printf("Get(\\"k1\\") after put in transaction: %s\\n", val) // Expected: v2
	s.Abort()
	val, _ = s.Get("k1"); fmt.Printf("Get(\\"k1\\") after abort: %s\\n", val) // Expected: v1

	fmt.Println("\\n--- Transaction 2 (Commit) ---")
	s.Put("k1", "v1") // Reset state
	s.StartTransaction()
	val, _ = s.Get("k1"); fmt.Printf("Get(\\"k1\\") inside transaction: %s\\n", val) // Expected: v1
	s.Put("k1", "v2")
	val, _ = s.Get("k1"); fmt.Printf("Get(\\"k1\\") after put in transaction: %s\\n", val) // Expected: v2
	s.Commit()
	val, _ = s.Get("k1"); fmt.Printf("Get(\\"k1\\") after commit: %s\\n", val) // Expected: v2
}
`,
    tags: {
      level: 'Hard',
      concept: 'Data Structures',
      label: 'Hard'
    },
    requirements: [
      'Implement `Get`, `Put`, and `Delete` operations.',
      'Implement `StartTransaction`, `Commit`, and `Abort` logic.',
      'Operations within a transaction must be isolated.',
      '`Commit` should apply all transactional changes atomically.',
      '`Abort` should discard all transactional changes.',
      'The store must be safe for concurrent access (though transaction logic can be single-threaded for simplicity).',
    ],
    example: {
      input: `s.StartTransaction(); s.Put("k", "v2"); s.Abort();`,
      output: `s.Get("k") returns the original value, not "v2".`,
      explanation: 'Changes made within a transaction are only finalized upon commit. Aborting the transaction discards all its changes.',
    },
    hints: [
      'Use a separate map to buffer changes during a transaction.',
      'The `Commit` operation should atomically merge the buffer map into the main data map.',
      'The `Abort` operation should simply clear the buffer map.',
      'Use a mutex to protect access to the transaction state and data maps.',
      'Consider how to handle a `Delete` operation in the buffered map. A pointer to a string (`*string`) where `nil` signifies deletion can be a useful pattern.'
    ],
  },
  {
    id: 'cycle-booking-system',
    title: 'Cycle Booking System',
    description: 'Design the classes and APIs for a cycle booking system. The system should manage different types of cycles (e.g., electric, manual), allow users to rent them, and enable administrators to mark cycles as defective.',
    skeletonCode: `package main

import (
	"fmt"
	"time"
)

type CycleType string
const (
	Electric CycleType = "Electric"
	Manual   CycleType = "Manual"
)

type CycleStatus string
const (
	Available CycleStatus = "Available"
	Rented    CycleStatus = "Rented"
	Defective CycleStatus = "Defective"
)

// Cycle represents the common interface for all cycle types.
type Cycle interface {
	ID() string
	Type() CycleType
	Status() CycleStatus
	SetStatus(status CycleStatus)
}

// ManualCycle is a specific implementation of a cycle.
type ManualCycle struct {
	id     string
	status CycleStatus
}

// ElectricCycle is another implementation.
type ElectricCycle struct {
	id         string
	status     CycleStatus
	batteryLevel int // Percentage
}


// User represents a customer of the system.
type User struct {
	ID   string
	Name string
}

// BookingSystem is the main entry point for all operations.
type BookingSystem struct {
	// TODO: Add fields to store cycles, users, and rentals.
}

func NewBookingSystem() *BookingSystem {
	// TODO: Implement constructor.
	return &BookingSystem{}
}

func (bs *BookingSystem) AddCycle(cycleType CycleType, id string) {
	// TODO: Implement adding a new cycle to the system.
}

func (bs *BookingSystem) MarkCycleAsDefective(cycleID string) {
	// TODO: Implement marking a cycle as defective.
}

func (bs *BookingSystem) RentCycle(userID string, cycleType CycleType) (Cycle, error) {
	// TODO: Implement renting the first available cycle of a given type.
	return nil, fmt.Errorf("not implemented")
}

func (bs *BookingSystem) ReturnCycle(cycleID string) {
	// TODO: Implement returning a rented cycle.
}

func main() {
	system := NewBookingSystem()
	system.AddCycle(Manual, "M001")
	system.AddCycle(Electric, "E001")

	fmt.Println("Renting a manual cycle...")
	rentedCycle, err := system.RentCycle("user123", Manual)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("Rented cycle %s\\n", rentedCycle.ID())
	}
	
	system.MarkCycleAsDefective("E001")
	fmt.Println("Renting an electric cycle...")
	_, err = system.RentCycle("user456", Electric)
	if err != nil {
		// This should fail if E001 was the only one.
		fmt.Println("Error:", err)
	}
}
`,
    tags: {
      level: 'Medium',
      concept: 'System Design',
      label: 'Medium'
    },
    requirements: [
      'Design data models for Users, Cycles (with different types), and Rentals.',
      'Implement logic to add new cycles to the inventory.',
      'Allow renting an available cycle of a specific type.',
      'Allow returning a rented cycle, making it available again.',
      'Provide a way to mark a cycle as defective, making it unavailable for rent.',
      'Operations should handle edge cases like no available cycles.',
    ],
    example: {
      input: `system.RentCycle("user123", "Manual")`,
      output: `Returns an available manual cycle instance and marks it as rented.`,
      explanation: 'The system finds an available cycle of the requested type, updates its status to "Rented", and assigns it to the user.',
    },
    hints: [
      'Use an interface for `Cycle` to handle different types polymorphically.',
      'Use maps to store cycles and users by their IDs for efficient lookups.',
      'Consider creating a `Rental` struct to track who rented which bike and when.',
      'Ensure state transitions are handled correctly (e.g., a defective cycle cannot be rented).',
    ],
  },
   {
    id: 'splitwise-design',
    title: 'Splitwise-like Expense Sharing App',
    description: 'Design a simplified expense sharing application like Splitwise. It should allow users to be created, expenses to be added for a group of users, and balances to be calculated to see who owes whom.',
    skeletonCode: `package main

import "fmt"

type UserID string

type ExpenseSplitType string
const (
    Equal   ExpenseSplitType = "Equal"
    // Future extensions: Exact, Percentage
)

// Expense represents a single spending event.
type Expense struct {
    PaidBy    UserID
    Amount    float64
    SplitType ExpenseSplitType
    SplitWith []UserID
}

// Balance represents the net amount a user is owed (positive) or owes (negative).
type Balance map[UserID]float64

// ExpenseManager is the core of the application.
type ExpenseManager struct {
    // TODO: Add fields for users and balances.
}

func NewExpenseManager() *ExpenseManager {
    // TODO: Implement the constructor.
    return &ExpenseManager{}
}

func (em *ExpenseManager) AddUser(id UserID, name string) {
    // TODO: Implement adding a user.
}

func (em *ExpenseManager) AddExpense(expense Expense) {
    // TODO: Implement adding an expense and updating balances.
    // For Equal split, the amount is divided equally among all in SplitWith.
}

func (em *ExpenseManager) GetBalances() Balance {
    // TODO: Return the current state of all balances.
    return make(Balance)
}

func (em *ExpenseManager) ShowBalances() {
    // TODO: Implement a helper to print balances in a readable format,
    // showing who owes whom. For example: "User B owes User A $10".
}

func main() {
    em := NewExpenseManager()
    em.AddUser("A", "Alice")
    em.AddUser("B", "Bob")
    em.AddUser("C", "Charlie")

    fmt.Println("--- Expense 1: Alice pays $30 for everyone (A, B, C) ---")
    em.AddExpense(Expense{
        PaidBy:    "A",
        Amount:    30.00,
        SplitType: Equal,
        SplitWith: []UserID{"A", "B", "C"},
    })
    em.ShowBalances() 
    // Expected: B owes A $10, C owes A $10

    fmt.Println("\\n--- Expense 2: Bob pays $15 for Bob and Charlie ---")
    em.AddExpense(Expense{
        PaidBy:    "B",
        Amount:    15.00,
        SplitType: Equal,
        SplitWith: []UserID{"B", "C"},
    })
    em.ShowBalances()
    // Expected: C owes A $10, C owes B $7.50, B owes A $2.50 (10 - 7.5)
}
`,
    tags: {
      level: 'Hard',
      concept: 'System Design',
      label: 'Hard'
    },
    requirements: [
      'Model users and their balances.',
      'Implement a way to add expenses with an "Equal" split type.',
      'Correctly calculate and update the balances of all involved users after an expense is added.',
      'Provide a way to view the simplified balances (i.e., who owes whom and how much).',
      'The system should handle multiple expenses and update balances cumulatively.',
    ],
    example: {
      input: 'Alice pays $30, split equally with Bob and Charlie.',
      output: 'Bob owes Alice $10, Charlie owes Alice $10.',
      explanation: 'Alice paid $30 for a group of 3, so each person\'s share is $10. Since Alice paid the full amount, Bob and Charlie each owe her their $10 share.',
    },
    hints: [
      'Use a map `map[UserID]float64` to store the net balance for each user. A positive value means the system owes them, a negative value means they owe the system.',
      'When an expense is added, for the payer, credit their balance. For the others in the split, debit their balances.',
      'To "Show Balances", you need an algorithm to simplify the debts. You can separate users into two groups (debtors and creditors) and match them until all balances are zeroed out.',
      'Consider using the Strategy design pattern to handle different expense split types in the future (Equal, Exact, Percentage).',
    ],
  },
  {
    id: 'web-crawler',
    title: 'Concurrent Web Crawler',
    description: 'Build a concurrent web crawler in Go. It should start from a given URL, fetch its content, parse it for new links on the same domain, and crawl those links concurrently, while avoiding duplicate fetches.',
    skeletonCode: `package main

import (
	"fmt"
	"net/http"
	"net/url"
	"sync"

	"golang.org/x/net/html"
)

type Crawler struct {
	visited map[string]bool
	mu      sync.Mutex
	wg      sync.WaitGroup
}

func NewCrawler() *Crawler {
	return &Crawler{
		visited: make(map[string]bool),
	}
}

// fetchAndParse fetches the content of a URL and returns the links found on the page.
func (c *Crawler) fetchAndParse(rawURL string) ([]string, error) {
	// TODO: Implement fetching the URL, parsing the HTML, and extracting 'href' attributes.
	// Return only absolute URLs that are on the same host as the original URL.
	return nil, nil
}

// Crawl starts the crawling process from a seed URL.
func (c *Crawler) Crawl(seedURL string) {
	// TODO: Implement the main crawling logic.
	// Use a channel to manage the queue of URLs to visit.
	// Use worker goroutines to process URLs from the channel.
	// Use the 'visited' map to avoid crawling the same URL twice.
	// Use the 'wg' to wait for all goroutines to finish.
}

func main() {
	crawler := NewCrawler()
	// This is a placeholder URL. In a real scenario, you might use a site you control for testing.
	// For this problem, the logic is more important than a live test.
	seedURL := "https://example.com"
	fmt.Printf("Starting crawl at: %s\\n", seedURL)
	
	crawler.Crawl(seedURL)
	
	fmt.Println("Crawl finished.")
}
`,
    tags: {
      level: 'Hard',
      concept: 'Concurrency',
      label: 'Hard'
    },
    requirements: [
      'Crawl pages concurrently to improve speed.',
      'Avoid visiting the same URL more than once.',
      'Only crawl links that belong to the same domain as the seed URL.',
      'Handle potential errors during HTTP requests or page parsing gracefully.',
    ],
    example: {
      input: `crawler.Crawl("https://example.com")`,
      output: 'A series of print statements indicating which URLs are being fetched.',
      explanation: 'The crawler starts at example.com, finds links to other pages within example.com, and visits them concurrently until all unique, same-domain pages have been visited.',
    },
    hints: [
      'Use a `map[string]bool` protected by a mutex to keep track of visited URLs.',
      'A buffered channel can serve as the work queue for URLs to be crawled.',
      'Launch a fixed number of worker goroutines that pull URLs from the channel.',
      'Use `sync.WaitGroup` to ensure the `Crawl` function doesn\'t exit until all workers are done.',
      'The `net/url` package is useful for parsing URLs and checking their hostnames.',
    ],
  },
];
