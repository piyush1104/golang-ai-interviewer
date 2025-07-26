
import type { Problem, MCQ, MCQCategory } from './types';

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

export const MCQ_CATEGORIES: MCQCategory[] = ['Syntax', 'Concurrency', 'Data Structures', 'Concepts', 'Code Fix'];

export const MCQ_PROBLEMS: MCQ[] = [
  {
    id: 'mcq-1',
    question: "What is the zero value of a pointer in Go?",
    options: ["0", "nil", `""`, "It causes a compile error"],
    correctAnswerIndex: 1,
    explanation: "`nil` is the zero value for pointers, interfaces, maps, slices, channels, and function types. It represents an uninitialized state.",
    category: 'Concepts'
  },
  {
    id: 'mcq-2',
    question: "How do you declare a constant in Go?",
    options: ["let PI = 3.14", "const PI = 3.14", "final PI = 3.14", "var PI = 3.14"],
    correctAnswerIndex: 1,
    explanation: "Go uses the `const` keyword to declare constants. They are determined at compile time and cannot be changed during program execution.",
    category: 'Syntax'
  },
  {
    id: 'mcq-3',
    question: "What does the `defer` keyword do in Go?",
    options: ["Executes a function at the end of the program.", "Executes a function call just before the surrounding function returns.", "Delays the execution of a function for a specified time.", "Runs a function in a separate goroutine."],
    correctAnswerIndex: 1,
    explanation: "A `defer` statement defers the execution of a function until the surrounding function returns. Deferred calls are pushed onto a stack and executed in last-in-first-out (LIFO) order.",
    category: 'Concepts'
  },
  {
    id: 'mcq-4',
    question: "Which of the following will result in a deadlock?",
    codeSnippet: `package main

func main() {
    ch := make(chan int)
    ch <- 1
    <-ch
}`,
    options: ["The code will run without issues.", "The code will cause a deadlock.", "The code will panic.", "The code will not compile."],
    correctAnswerIndex: 1,
    explanation: "Sending to an unbuffered channel (`ch <- 1`) blocks until a receiver is ready. In this single-goroutine program, no other goroutine is available to receive, so the program blocks forever, causing a deadlock.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-5',
    question: "What will be printed by the following code?",
    codeSnippet: `package main

import "fmt"

func main() {
    s := []int{1, 2, 3}
    s = append(s, 4, 5)
    fmt.Println(len(s), cap(s))
}`,
    options: ["5 5", "5 6", "3 6", "3 3"],
    correctAnswerIndex: 1,
    explanation: "When `append` causes a slice's underlying array to run out of capacity, Go allocates a new, larger array. The capacity often doubles. The original slice had a capacity of 3. Appending two elements exceeds this, so a new array of capacity 6 is allocated. The new length is 5.",
    category: 'Data Structures'
  },
  {
    id: 'mcq-6',
    question: "How do you check if a key exists in a map?",
    options: [`val := myMap["key"]`, `val, ok := myMap["key"]`, `exists(myMap, "key")`, `myMap.has("key")`],
    correctAnswerIndex: 1,
    explanation: "The 'comma ok' idiom is the standard way to check for key existence in a map. `ok` will be `true` if the key exists, and `false` otherwise, preventing confusion with zero values stored in the map.",
    category: 'Data Structures'
  },
  {
    id: 'mcq-7',
    question: "In Go, which of these is NOT a keyword?",
    options: ["interface", "goto", "select", "virtual"],
    correctAnswerIndex: 3,
    explanation: "Go does not have a `virtual` keyword. It achieves polymorphism through interfaces, which are satisfied implicitly without inheritance or virtual methods.",
    category: 'Syntax'
  },
  {
    id: 'mcq-8',
    question: "What is the purpose of a `sync.WaitGroup`?",
    options: ["To pause a goroutine for a specific duration.", "To wait for a collection of goroutines to finish.", "To create a mutex lock.", "To manage a pool of workers."],
    correctAnswerIndex: 1,
    explanation: "A `sync.WaitGroup` is used to block the execution of a goroutine until a set of other goroutines have completed their tasks. You `Add()` to the counter, and each goroutine calls `Done()` when it finishes.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-9',
    question: "What is the correct way to fix the race condition in this code?",
    codeSnippet: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var counter int
	var wg sync.WaitGroup
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			counter++ // Race condition here
		}()
	}
	wg.Wait()
	fmt.Println(counter)
}`,
    options: ["Use a channel to update the counter.", "Wrap the `counter++` operation with a `sync.Mutex`.", "Use `atomic.AddInt64` to increment the counter.", "All of the above are valid solutions."],
    correctAnswerIndex: 3,
    explanation: "All three options are valid ways to fix this race condition. A mutex provides exclusive access, an atomic operation ensures the increment happens without interruption, and a channel can be used to serialize updates from a dedicated goroutine.",
    category: 'Code Fix'
  },
  {
    id: 'mcq-10',
    question: "What is the difference between `new(T)` and `make(T)`?",
    options: ["There is no difference.", "`new` allocates memory and zeros it; `make` initializes slices, maps, and channels.", "`make` allocates memory; `new` initializes it.", "`new` returns a pointer; `make` returns a value."],
    correctAnswerIndex: 1,
    explanation: "`new(T)` allocates zeroed storage for a new item of type T and returns its address (a *T). `make(T)` is only for slices, maps, and channels, and it returns an initialized (not zeroed) value of type T (not *T).",
    category: 'Concepts'
  },
  {
    id: 'mcq-11',
    question: "How are errors typically handled in Go?",
    options: ["Using try-catch blocks.", "By returning an `error` value as the last return value of a function.", "By panicking and recovering.", "By checking a global error variable."],
    correctAnswerIndex: 1,
    explanation: "The idiomatic way to handle errors in Go is to have functions return an `error` as their last return value. The caller then checks if the error is `nil` before proceeding.",
    category: 'Concepts'
  },
  {
    id: 'mcq-12',
    question: "Which statement about Go interfaces is true?",
    options: ["A type must explicitly declare that it implements an interface.", "Interfaces are implemented implicitly.", "Interfaces can contain fields.", "A type can only implement one interface."],
    correctAnswerIndex: 1,
    explanation: "Go interfaces are satisfied implicitly. If a type has all the methods required by an interface, it is considered to implement that interface automatically, without any `implements` keyword.",
    category: 'Concepts'
  },
  {
    id: 'mcq-13',
    question: "What does the following code print?",
    codeSnippet: `package main

import "fmt"

func main() {
	for i := 0; i < 3; i++ {
		defer fmt.Print(i)
	}
}`,
    options: ["012", "123", "210", "000"],
    correctAnswerIndex: 2,
    explanation: "Deferred function calls are pushed onto a stack. When the surrounding function (`main`) returns, the calls are popped off and executed in LIFO order. The values of `i` (2, 1, 0) were evaluated and stored at the time of the `defer` call.",
    category: 'Syntax'
  },
  {
    id: 'mcq-14',
    question: "A `select` statement in Go is used to:",
    options: ["Choose between different `if-else` conditions.", "Wait on multiple channel operations.", "Iterate over a map.", "Define a type switch."],
    correctAnswerIndex: 1,
    explanation: "A `select` statement lets a goroutine wait on multiple communication operations (sends or receives on channels). It blocks until one of its cases can run, then it executes that case.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-15',
    question: "What is the visibility of a struct field that starts with a lowercase letter?",
    options: ["Public (exported)", "Private to the file", "Private to the package (unexported)", "It is a compile error"],
    correctAnswerIndex: 2,
    explanation: "In Go, identifiers (like struct fields, functions, or types) are exported (public) if they start with an uppercase letter. If they start with a lowercase letter, they are unexported (private) to the package they are defined in.",
    category: 'Syntax'
  },
  {
    id: 'mcq-16',
    question: "What is a buffered channel?",
    options: ["A channel that can store a limited number of values without a corresponding receiver.", "A channel that can only store one value.", "A channel that is faster than a regular channel.", "A channel that can be read by multiple goroutines simultaneously."],
    correctAnswerIndex: 0,
    explanation: "A buffered channel has a capacity greater than zero (`make(chan int, 10)`). Senders to a buffered channel only block when the buffer is full. Receivers block only when the buffer is empty.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-17',
    question: "What is the output of this program?",
    codeSnippet: `package main
import "fmt"

func main() {
    var m map[string]int
    m["key"] = 1
    fmt.Println(m)
}`,
    options: ["map[key:1]", "map[]", "nil", "A panic occurs."],
    correctAnswerIndex: 3,
    explanation: "A nil map cannot be written to. The line `m[\"key\"] = 1` will cause a runtime panic because the map `m` was declared but not initialized with `make()`.",
    category: 'Code Fix'
  },
  {
    id: 'mcq-18',
    question: "What is `go vet` used for?",
    options: ["Formatting Go code according to standards.", "Running unit tests.", "Reporting suspicious constructs in Go programs.", "Compiling Go code."],
    correctAnswerIndex: 2,
    explanation: "`go vet` is a tool that examines Go source code and reports suspicious constructs, such as `Printf` calls whose arguments do not align with the format string, or methods that are shadowed by embedding.",
    category: 'Concepts'
  },
  {
    id: 'mcq-19',
    question: "In Go, arrays are:",
    options: ["Reference types", "Value types", "Dynamically sized", "The same as slices"],
    correctAnswerIndex: 1,
    explanation: "Arrays in Go are value types. When an array is assigned to a new variable or passed to a function, the entire array is copied. This is different from slices, which are reference types.",
    category: 'Data Structures'
  },
  {
    id: 'mcq-20',
    question: "What does the `context` package primarily help with?",
    options: ["Managing application configuration.", "Parsing command-line arguments.", "Handling request-scoped values, cancellation signals, and deadlines across API boundaries and between goroutines.", "Providing helper functions for data structures."],
    correctAnswerIndex: 2,
    explanation: "The `context` package is essential for managing the lifecycle of requests. It provides a standard way to propagate cancellation signals, deadlines, and other request-scoped data through a call chain, especially in concurrent programs.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-21',
    question: "What happens when a `case` in a `select` statement corresponds to a `nil` channel?",
    codeSnippet: `package main
import "fmt"

func main() {
    ch1 := make(chan int, 1)
    var ch2 chan int // ch2 is nil
    ch1 <- 1
    
    select {
    case <-ch1:
        fmt.Println("Read from ch1")
    case ch2 <- 1:
        fmt.Println("Wrote to ch2")
    }
}`,
    options: ["The select statement will block forever.", "The program will panic.", "The program will print 'Read from ch1'.", "It will randomly choose between the two cases."],
    correctAnswerIndex: 2,
    explanation: "A case in a `select` statement involving a `nil` channel is always ignored and will never be selected. Therefore, the `select` statement only considers the `case <-ch1`, which is ready. The program will not block or panic.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-22',
    question: "What is the likely issue with using `time.After` inside a `for` loop like this?",
    codeSnippet: `func process(tasks <-chan int) {
    for {
        select {
        case task := <-tasks:
            fmt.Println("Processing task:", task)
        case <-time.After(1 * time.Minute):
            fmt.Println("Timed out")
            return
        }
    }
}`,
    options: ["A deadlock will occur if no tasks are received.", "The code has a race condition on the `tasks` channel.", "A memory leak can occur because a new Timer is allocated in each loop iteration.", "The code is perfectly fine and has no issues."],
    correctAnswerIndex: 2,
    explanation: "`time.After(d)` creates a new `Timer` object on every call. If the `tasks` channel receives frequently, the old, unused timers may not be garbage collected promptly, leading to a memory leak. A better pattern is to create a single timer outside the loop and use `Reset`.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-23',
    question: "What happens when this program, which attempts a lock upgrade, is run?",
    codeSnippet: `package main
import "sync"

func main() {
    var mu sync.RWMutex
    mu.RLock()
    mu.Lock() // Attempt to upgrade to a write lock
    mu.Unlock()
    mu.RUnlock()
}`,
    options: ["It runs successfully.", "It panics.", "It results in a deadlock.", "It fails to compile."],
    correctAnswerIndex: 2,
    explanation: "A goroutine holding a read lock (`RLock`) cannot acquire a write lock (`Lock`) on the same `RWMutex` without first releasing the read lock. This attempt to 'upgrade' the lock will cause the goroutine to block forever, waiting for itself to release the read lock, resulting in a deadlock.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-24',
    question: "In the following code, how many times will 'Initialization complete' be printed?",
    codeSnippet: `package main
import (
    "fmt"
    "sync"
)

func main() {
    var once sync.Once
    var wg sync.WaitGroup
    initFunc := func() { fmt.Println("Initialization complete") }
    
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            once.Do(initFunc)
        }()
    }
    wg.Wait()
}`,
    options: ["10", "1", "0", "It is non-deterministic."],
    correctAnswerIndex: 1,
    explanation: "`sync.Once` guarantees that the function passed to its `Do` method is executed exactly one time, regardless of how many goroutines call it concurrently. The first goroutine to acquire the lock within `Do` will execute the function; all others will block and then return without executing it.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-25',
    question: "What is the result of sending a value to a closed channel?",
    codeSnippet: `package main

func main() {
    ch := make(chan int, 1)
    close(ch)
    ch <- 1
}`,
    options: ["The send operation blocks forever.", "The value is silently discarded.", "The program panics.", "The send operation returns immediately without error."],
    correctAnswerIndex: 2,
    explanation: "Attempting to send a value to a channel that has already been closed will cause a runtime panic. Conversely, receiving from a closed channel is safe and will yield the zero value for the channel's type.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-26',
    question: "Identify the concurrency bug in this code snippet.",
    codeSnippet: `func main() {
    ch := make(chan string)
    go func() {
        // This goroutine is supposed to receive, but it returns early.
        if true { return }
        <-ch 
    }()
    ch <- "hello" // This line will block.
}`,
    options: ["Race condition on channel `ch`.", "A goroutine leak.", "The program will panic.", "There is no bug; the program will complete."],
    correctAnswerIndex: 1,
    explanation: "The main goroutine sends to the unbuffered channel `ch` and blocks, waiting for a receiver. The spawned goroutine, which is the intended receiver, returns immediately. Since no other goroutine can receive from `ch`, the main goroutine blocks forever, and the spawned goroutine leaks because it's waiting in the Go runtime's run queue but never finishes.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-27',
    question: "What is the best practice for keys used with `context.WithValue`?",
    options: ["Using built-in types like `string` or `int`.", "Using an unexported custom type.", "Using a global variable.", "Using a pointer to a struct."],
    correctAnswerIndex: 1,
    explanation: "The best practice is to use an unexported (lowercase) custom type for context keys. This prevents key collisions between different packages, as two packages cannot access each other's unexported types, ensuring that one package's context value doesn't accidentally overwrite another's.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-28',
    question: "What is a key characteristic of objects stored in a `sync.Pool`?",
    options: ["They are guaranteed to persist for the lifetime of the application.", "They can be automatically removed from the pool at any time by the garbage collector.", "They are accessible by a unique key.", "They provide automatic thread-safety for the object's methods."],
    correctAnswerIndex: 1,
    explanation: "`sync.Pool` is a cache for temporary objects. A key feature is that any object stored in the pool may be arbitrarily removed at any time without notification, especially during garbage collection cycles. It should not be used for long-term storage.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-29',
    question: "What is the behavior of a `for...range` loop on a channel after the channel is closed?",
    options: ["The loop panics.", "The loop exits immediately.", "The loop continues to receive values that were sent before the close, then exits.", "The loop blocks forever."],
    correctAnswerIndex: 2,
    explanation: "The `for...range` loop on a channel will first receive all remaining values from the channel's buffer. Once the channel is empty and has been closed, the loop terminates gracefully.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-30',
    question: "What is the purpose of the `default` case in a `select` statement?",
    options: ["It is executed if the `select` statement has been blocking for a certain amount of time.", "It provides a fallback case if all other channel operations would block.", "It is a required final case for all `select` statements.", "It is executed after another case is chosen."],
    correctAnswerIndex: 1,
    explanation: "The `default` case makes a `select` statement non-blocking. If no other channel send or receive is immediately ready, the `default` case is executed instead of the `select` statement blocking.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-31',
    question: "What happens if you attempt to close a channel that has already been closed?",
    options: ["It has no effect.", "It returns an error.", "It causes a runtime panic.", "It re-opens the channel."],
    correctAnswerIndex: 2,
    explanation: "Closing an already closed channel results in a runtime panic. It is crucial to ensure that only one goroutine is responsible for closing a channel, typically the sender.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-32',
    question: "When is `sync.Map` preferable to a standard `map` with a `sync.RWMutex`?",
    options: ["When the map is write-heavy with frequent additions and deletions.", "When keys are written once and read many times by many goroutines.", "When the map is small and has low contention.", "When you need to range over the map frequently."],
    correctAnswerIndex: 1,
    explanation: "`sync.Map` is optimized for two specific use cases: when the entry for a given key is only ever written once but read many times, or when multiple goroutines read, write, and overwrite entries for disjoint sets of keys. In write-heavy or high-contention scenarios on the same keys, a `map` with a `Mutex` can be more performant.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-33',
    question: "If multiple cases in a `select` statement are ready to proceed, which one is chosen?",
    options: ["The first case listed in the source code.", "The case that has been waiting the longest.", "A case is chosen pseudo-randomly.", "All ready cases are executed simultaneously."],
    correctAnswerIndex: 2,
    explanation: "If multiple cases in a `select` statement can proceed, Go's runtime makes a pseudo-random choice among them. This prevents starvation where one channel in a `select` might always be prioritized over others.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-34',
    question: "What happens when you attempt to send a value to a `nil` channel?",
    options: ["The program panics.", "The send operation blocks forever.", "The value is discarded and the operation returns immediately.", "It returns an error."],
    correctAnswerIndex: 1,
    explanation: "Sending to a `nil` channel blocks the goroutine indefinitely. Similarly, receiving from a `nil` channel also blocks forever. This is a common source of deadlocks.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-35',
    question: "What is wrong with the `sync.WaitGroup` usage in this code?",
    codeSnippet: `package main
import "sync"

func main() {
    var wg sync.WaitGroup
    for i := 0; i < 5; i++ {
        go func(val int) {
            defer wg.Done()
            wg.Add(1) // Incorrect placement
            // do work with val
        }(i)
    }
    wg.Wait()
}`,
    options: ["`wg.Done()` is called with defer.", "A race condition exists on `wg.Add()` and `wg.Wait()`.", "`wg.Add(1)` should not be called inside the goroutine.", "Both B and C are correct."],
    correctAnswerIndex: 3,
    explanation: "`wg.Add()` must be called in the main goroutine before the worker goroutine is launched. If `Add` is called inside the worker, the main goroutine's `wg.Wait()` might execute before `Add` is ever called, leading to a panic or incorrect synchronization. This is a race condition.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-36',
    question: "If a parent `context` is cancelled, what happens to a child `context` derived from it?",
    options: ["The child context is unaffected.", "The child context is also cancelled automatically.", "The child context panics.", "The child context must be manually cancelled."],
    correctAnswerIndex: 1,
    explanation: "Context cancellation propagates down the context tree. When a parent context is cancelled (either via its `cancel` function, a timeout, or a deadline), all child contexts derived from it are immediately cancelled as well.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-37',
    question: "When is it generally better to use `atomic` operations instead of a `sync.Mutex`?",
    options: ["For protecting complex multi-step operations on a struct.", "For simple, primitive operations like incrementing a numeric counter.", "When the critical section is very large.", "When you need to support recursive locking."],
    correctAnswerIndex: 1,
    explanation: "Atomic operations are ideal for very simple operations on primitive types (e.g., integers, pointers). They are much more performant than mutexes as they don't involve the OS scheduler or context switching. Mutexes are necessary for protecting more complex critical sections involving multiple operations.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-38',
    question: "What is the behavior of an empty select statement: `select {}`?",
    options: ["It causes a compile error.", "It returns immediately.", "It panics at runtime.", "It blocks the goroutine forever."],
    correctAnswerIndex: 3,
    explanation: "An empty `select` statement with no cases will block the current goroutine forever. This can be a deliberate technique to prevent a program (like a server) from exiting, although using channels is more common.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-39',
    question: "What is the primary difference between `sync.Cond.Signal()` and `sync.Cond.Broadcast()`?",
    options: ["`Signal` is non-blocking, while `Broadcast` is blocking.", "`Signal` wakes up one waiting goroutine, while `Broadcast` wakes up all waiting goroutines.", "`Signal` is for sending data, while `Broadcast` is for closing.", "There is no functional difference."],
    correctAnswerIndex: 1,
    explanation: "`Signal()` will wake up exactly one goroutine that is waiting on the condition variable (if any). `Broadcast()` will wake up all goroutines that are currently waiting. `Signal` is used when any waiting goroutine can handle the state change, while `Broadcast` is used when all waiting goroutines need to re-evaluate the condition.",
    category: 'Concurrency'
  },
  {
    id: 'mcq-40',
    question: "What happens on the 4th send operation in this code?",
    codeSnippet: `package main

func main() {
    ch := make(chan int, 3)
    ch <- 1
    ch <- 2
    ch <- 3
    ch <- 4 // What happens here?
}`,
    options: ["The program panics due to channel overflow.", "The value 4 overwrites the value 1.", "The send operation blocks until another goroutine receives a value from the channel.", "The channel's capacity is automatically increased."],
    correctAnswerIndex: 2,
    explanation: "A buffered channel of capacity 3 can hold 3 values without a corresponding receiver. The first three sends will complete immediately. The fourth send will block because the channel's buffer is full. It will remain blocked until a value is received from the channel by another goroutine.",
    category: 'Concurrency'
  }
];
