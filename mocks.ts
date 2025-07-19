
import type { SubmissionWithReview } from './types';

export const MOCKED_SUBMISSIONS: Record<string, SubmissionWithReview> = {
  'worker-pool': {
    id: 'mock-sub-worker-pool',
    problemId: 'worker-pool',
    timestamp: new Date('2024-05-10T10:00:00Z').toISOString(),
    isMock: true,
    code: `package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

type Job struct {
	ID   int
	Data interface{}
}

type Result struct {
	JobID int
	Data  interface{}
	Error error
}

type WorkerPool struct {
	numWorkers    int
	jobs          chan Job
	results       chan Result
	wg            sync.WaitGroup
	ctx           context.Context
	cancel        context.CancelFunc
}

func NewWorkerPool(numWorkers int, maxJobsPerSec int) *WorkerPool {
    ctx, cancel := context.WithCancel(context.Background())
	return &WorkerPool{
        numWorkers: numWorkers,
        jobs:       make(chan Job, 100),
        results:    make(chan Result, 100),
        ctx:        ctx,
        cancel:     cancel,
    }
}

func (wp *WorkerPool) Start() {
    for i := 0; i < wp.numWorkers; i++ {
        wp.wg.Add(1)
        go wp.worker(i)
    }
}

func (wp *WorkerPool) worker(id int) {
    defer wp.wg.Done()
    for {
        select {
        case job, ok := <-wp.jobs:
            if !ok {
                return 
            }
            fmt.Printf("Worker %d processing job %d\\n", id, job.ID)
            time.Sleep(100 * time.Millisecond) // Simulate work
            wp.results <- Result{JobID: job.ID, Data: "Completed"}
        case <-wp.ctx.Done():
            return
        }
    }
}

func (wp *WorkerPool) Submit(job Job) {
    select {
    case wp.jobs <- job:
    case <-wp.ctx.Done():
    }
}

func (wp *WorkerPool) Stop() {
    close(wp.jobs)
    wp.wg.Wait()
    wp.cancel()
    close(wp.results)
}

func main() {
    pool := NewWorkerPool(3, 10)
    pool.Start()

    go func() {
        for result := range pool.results {
            fmt.Printf("Received result for job %d: %v\\n", result.JobID, result.Data)
        }
    }()

    for i := 1; i <= 15; i++ {
        pool.Submit(Job{ID: i})
    }

    time.Sleep(2 * time.Second)
    pool.Stop()
    fmt.Println("Worker pool stopped.")
}
`,
    review: {
      score: 78,
      feedback: "This is a solid attempt at building a worker pool. The basic structure with channels for jobs and results, and goroutines for workers is well-implemented. Graceful shutdown using a WaitGroup and context cancellation is also present. However, it misses key requirements like rate limiting and robust error/panic handling, which are critical for a production-grade system.",
      strengths: [
        "Good use of channels for job distribution and result collection.",
        "Correctly implements graceful shutdown using `sync.WaitGroup` to wait for workers to finish.",
        "Uses `context.Context` for cancellation, allowing workers to exit cleanly when the pool is stopped.",
        "Separation of concerns between `Start`, `Submit`, and `Stop` methods is clear."
      ],
      areasForImprovement: [
        "The `maxJobsPerSec` parameter is accepted but never used. Rate limiting is a core requirement that has been missed.",
        "There is no panic handling within the worker goroutines. A panic in one worker would crash the entire application.",
        "The `Result` struct includes an `Error` field, but there's no logic to handle or generate errors during job processing.",
        "The main function's result handling logic is basic. In a real application, you'd need a more robust way to consume results that doesn't rely on the pool stopping."
      ],
    },
  },
  'rate-limiter': {
    id: 'mock-sub-rate-limiter',
    problemId: 'rate-limiter',
    timestamp: new Date('2024-05-10T11:00:00Z').toISOString(),
    isMock: true,
    code: `package main

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
    now := time.Now()
    elapsed := now.Sub(tb.lastRefill)
    tokensToAdd := int(elapsed / tb.refillRate)

    if tokensToAdd > 0 {
        tb.tokens += tokensToAdd
        if tb.tokens > tb.capacity {
            tb.tokens = tb.capacity
        }
        tb.lastRefill = now
    }
}

func (tb *TokenBucket) Allow() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()
    tb.refill()
	if tb.tokens > 0 {
		tb.tokens--
		return true
	}
	return false
}

func main() {
    // ... main function from skeleton
}
`,
    review: {
      score: 85,
      feedback: "The implementation correctly follows the token bucket algorithm's logic. It's well-structured and uses a mutex to ensure basic thread safety. The core logic for allowing/denying requests based on available tokens is sound. The main area for improvement lies in making the refill logic more robust and considering the implications of lock contention in a high-throughput scenario.",
      strengths: [
        "The `TokenBucket` struct is well-defined and contains all the necessary state.",
        "The `Allow` method correctly uses a `sync.Mutex` to prevent race conditions on the `tokens` and `lastRefill` fields.",
        "The refill logic correctly calculates tokens to add based on elapsed time and caps the total tokens at the bucket's capacity."
      ],
      areasForImprovement: [
        "The `refill` method is called inside the locked section of `Allow`. For high-frequency calls, this could become a bottleneck. It might be more performant to have an independent background goroutine that refills the bucket periodically.",
        "The `lastRefill` timestamp is only updated when tokens are added. If the bucket is full and no tokens are added for a long time, the next refill might add a large burst of tokens based on a very old `lastRefill` time, which is correct but could be optimized by updating `lastRefill` on every check.",
        "The `refillRate` is a duration per token. This is slightly confusing. It's more conventional to define it as 'tokens per second' (e.g., `rate.Limit` in Go's standard library).",
      ]
    }
  },
  'in-memory-kv': {
    id: 'mock-sub-in-memory-kv',
    problemId: 'in-memory-kv',
    timestamp: new Date('2024-05-10T12:00:00Z').toISOString(),
    isMock: true,
    code: `package main

import (
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
	return &InMemoryKVStore{
		data: make(map[string]storeItem),
	}
}

func (s *InMemoryKVStore) Set(key string, value interface{}, ttl time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var expiry int64
	if ttl > 0 {
		expiry = time.Now().Add(ttl).UnixNano()
	}
	s.data[key] = storeItem{value: value, expiry: expiry}
}

func (s *InMemoryKVStore) Get(key string) (interface{}, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, found := s.data[key]
	if !found {
		return nil, false
	}
	if item.expiry > 0 && time.Now().UnixNano() > item.expiry {
		// Not deleting it here to avoid needing a full Lock
		return nil, false
	}
	return item.value, true
}

func (s *InMemoryKVStore) Delete(key string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.data, key)
}
`,
    review: {
      score: 82,
      feedback: "This is a very good implementation of a thread-safe K/V store. It correctly uses RWMutex for optimized concurrent access and handles TTL logic correctly on `Get`. The code is clean and idiomatic. The primary missing piece is the active cleanup of expired keys, which can lead to unbounded memory growth in write-heavy applications with TTLs.",
      strengths: [
        "Excellent use of `sync.RWMutex` to allow concurrent reads while protecting writes, which is optimal for read-heavy workloads.",
        "The `Set` and `Delete` operations are correctly implemented with a full write lock.",
        "The `Get` operation correctly checks for key expiry and returns false for expired keys, effectively implementing the TTL logic on read.",
        "Code is clean, well-structured, and follows Go conventions."
      ],
      areasForImprovement: [
        "Expired keys are never removed from the `data` map, only ignored upon `Get`. This constitutes a memory leak, as the map will grow indefinitely if keys are not overwritten or manually deleted.",
        "A background goroutine with a `time.Ticker` should be implemented to periodically scan and purge expired keys from the map to reclaim memory.",
        "In the `Get` method, if a key is found to be expired, it could be deleted. However, this would require upgrading the `RLock` to a `Lock`, which complicates the logic. The background cleanup is a cleaner approach."
      ]
    }
  },
   'transactional-kv-store': {
    id: 'mock-sub-transactional-kv-store',
    problemId: 'transactional-kv-store',
    timestamp: new Date('2024-05-10T13:00:00Z').toISOString(),
    isMock: true,
    code: `package main

import (
	"errors"
	"fmt"
	"sync"
)

type store struct {
	mu           sync.RWMutex
	data         map[string]string
	inTransaction bool
	pendingData  map[string]*string
}

func NewStore() TransactionalKVStore {
	return &store{
		data: make(map[string]string),
	}
}

func (s *store) Get(key string) (string, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.inTransaction {
		if val, ok := s.pendingData[key]; ok {
			if val == nil { // Deleted in transaction
				return "", false
			}
			return *val, true
		}
	}
	val, ok := s.data[key]
	return val, ok
}

func (s *store) Put(key, value string) {
	if !s.inTransaction {
        s.mu.Lock()
        s.data[key] = value
        s.mu.Unlock()
		return
	}
	s.pendingData[key] = &value
}

func (s *store) Delete(key string) {
	if !s.inTransaction {
        s.mu.Lock()
        delete(s.data, key)
        s.mu.Unlock()
		return
	}
	s.pendingData[key] = nil
}

func (s *store) StartTransaction() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.inTransaction {
		return errors.New("transaction already in progress")
	}
	s.inTransaction = true
	s.pendingData = make(map[string]*string)
	return nil
}

func (s *store) Commit() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if !s.inTransaction {
		return errors.New("not in a transaction")
	}
	for k, v := range s.pendingData {
		if v == nil {
			delete(s.data, k)
		} else {
			s.data[k] = *v
		}
	}
	s.inTransaction = false
	s.pendingData = nil
	return nil
}

func (s *store) Abort() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if !s.inTransaction {
		return errors.New("not in a transaction")
	}
	s.inTransaction = false
	s.pendingData = nil
	return nil
}
`,
    review: {
      score: 92,
      feedback: "This is an excellent and complete implementation of a transactional key-value store. It correctly handles transactional state, isolation, and atomicity for commit/abort operations. The use of a temporary map for pending data and a pointer to a string to differentiate between updates and deletes is a classic, effective pattern. The code is thread-safe and robust.",
      strengths: [
        "Correctly implements transaction isolation. Reads during a transaction reflect pending changes before falling back to the main data store.",
        "The use of `map[string]*string` for `pendingData` is an idiomatic way to handle the three states: set a new value, delete (nil), or no change.",
        "`Commit` and `Abort` operations are atomic and correctly manipulate the transaction state.",
        "Proper use of `sync.RWMutex` to ensure thread safety across all operations.",
        "Error handling is good, for example, by preventing a new transaction from starting while another is in progress."
      ],
      areasForImprovement: [
        "The locking strategy is a bit coarse. `StartTransaction`, `Commit`, and `Abort` take a full write lock for their entire duration. While correct, this could be optimized, although it would add complexity.",
        "A `Put` or `Delete` operation outside of a transaction also takes a full lock. For this simple case, it's fine. In a more complex system, these might be considered auto-committing transactions.",
        "The solution doesn't explicitly mention handling concurrent transactions, assuming one transaction at a time for the whole store. This is a reasonable simplification for the problem as stated."
      ]
    }
  },
  'cycle-booking-system': {
    id: 'mock-sub-cycle-booking-system',
    problemId: 'cycle-booking-system',
    timestamp: new Date('2024-05-10T14:00:00Z').toISOString(),
    isMock: true,
    code: `package main

import (
	"fmt"
	"sync"
)

// Using skeleton types...

type Cycle interface {
	ID() string
	Type() CycleType
	Status() CycleStatus
	SetStatus(status CycleStatus)
}

// ... Manual/Electric structs

type BookingSystem struct {
	cycles  map[string]Cycle
	users   map[string]User
	mu      sync.Mutex
}

func NewBookingSystem() *BookingSystem {
	return &BookingSystem{
		cycles: make(map[string]Cycle),
		users:  make(map[string]User),
	}
}

func (bs *BookingSystem) AddCycle(cycleType CycleType, id string) {
	bs.mu.Lock()
	defer bs.mu.Unlock()
	var newCycle Cycle
	if cycleType == Manual {
		// Assume ManualCycle implementation exists
		// newCycle = &ManualCycle{id: id, status: Available}
	} else {
		// Assume ElectricCycle implementation exists
		// newCycle = &ElectricCycle{id: id, status: Available, batteryLevel: 100}
	}
	bs.cycles[id] = newCycle
}

func (bs *BookingSystem) RentCycle(userID string, cycleType CycleType) (Cycle, error) {
	bs.mu.Lock()
	defer bs.mu.Unlock()

	for _, cycle := range bs.cycles {
		if cycle.Type() == cycleType && cycle.Status() == Available {
			cycle.SetStatus(Rented)
			return cycle, nil
		}
	}

	return nil, fmt.Errorf("no %s cycles available", cycleType)
}
//... other methods partially implemented
`,
    review: {
      score: 68,
      feedback: "The design shows a basic understanding of the required data structures, using maps to store cycles and users. The use of an interface for `Cycle` is appropriate. However, the implementation is incomplete and has significant gaps in functionality and robustness. Error handling is minimal, and key operations like returning or marking cycles defective are not fully fleshed out. The concurrency model is overly simple and could lead to performance issues.",
      strengths: [
        "The use of a `Cycle` interface is a good design choice for supporting different cycle types.",
        "Using maps for storing cycles and users by ID allows for efficient lookups.",
        "The `RentCycle` method correctly iterates to find an available cycle, although its search is inefficient."
      ],
      areasForImprovement: [
        "The `AddCycle` method is incomplete and doesn't actually instantiate the cycle objects.",
        "The `RentCycle` method performs a linear scan over all cycles. For a large fleet, this would be very slow. It would be better to maintain separate lists or queues of available cycles per type.",
        "A single mutex for the entire `BookingSystem` will cause high lock contention. More granular locking (e.g., separate locks for cycles and users, or by cycle type) would be more scalable.",
        "The system doesn't track which user has rented which cycle, making returns impossible to manage correctly. A `Rental` or `Booking` struct is needed to link users, cycles, and rental times.",
        "The `ReturnCycle` and `MarkCycleAsDefective` functions are not implemented."
      ]
    }
  },
  'splitwise-design': {
    id: 'mock-sub-splitwise-design',
    problemId: 'splitwise-design',
    timestamp: new Date('2024-05-10T15:00:00Z').toISOString(),
    isMock: true,
    code: `package main

import "fmt"

type UserID string
type Balance map[UserID]float64

type ExpenseManager struct {
    users    map[UserID]string
    balances Balance
}

func NewExpenseManager() *ExpenseManager {
    return &ExpenseManager{
        users:    make(map[UserID]string),
        balances: make(Balance),
    }
}

func (em *ExpenseManager) AddUser(id UserID, name string) {
    em.users[id] = name
    em.balances[id] = 0
}

func (em *ExpenseManager) AddExpense(expense Expense) {
    if expense.SplitType != Equal {
        fmt.Println("Only Equal split is supported")
        return
    }

    splitCount := len(expense.SplitWith)
    if splitCount == 0 {
        return
    }
    share := expense.Amount / float64(splitCount)

    // Credit the payer
    em.balances[expense.PaidBy] += expense.Amount

    // Debit everyone in the split
    for _, userID := range expense.SplitWith {
        em.balances[userID] -= share
    }
}

func (em *ExpenseManager) ShowBalances() {
    fmt.Println("--- Current Balances ---")
    for userID, balance := range em.balances {
        if balance > 0 {
            fmt.Printf("%s is owed %.2f\\n", em.users[userID], balance)
        } else if balance < 0 {
            fmt.Printf("%s owes %.2f\\n", em.users[userID], -balance)
        }
    }
    fmt.Println("------------------------")
}
`,
    review: {
      score: 75,
      feedback: "This is a good start that correctly models the core logic of tracking balances. The `AddExpense` function correctly updates the net balances for an 'Equal' split. The main shortcoming is that `ShowBalances` only displays the net amount each person owes or is owed to the system as a whole, rather than simplifying the debts to show concrete 'who owes whom' relationships, which is the core value of a Splitwise-like app.",
      strengths: [
        "The data structures for users and balances are appropriate.",
        "The `AddExpense` logic is correct for the 'Equal' split type. It correctly credits the payer and debits all participants.",
        "The balance calculations are cumulative and handle multiple expenses correctly."
      ],
      areasForImprovement: [
        "The `ShowBalances` function is the biggest area for improvement. It needs a settlement algorithm. The current output is hard to act on. For example, if A owes $10 and B is owed $10, it should print 'A owes B $10'.",
        "The simplification algorithm typically involves separating users into two groups (debtors and creditors) and then matching payments between them until all debts are settled.",
        "The code is not thread-safe. In a real-world application, a mutex would be needed to protect access to the `balances` map.",
        "Error handling is minimal (e.g., what if a user in `SplitWith` doesn't exist?)."
      ]
    }
  },
  'web-crawler': {
    id: 'mock-sub-web-crawler',
    problemId: 'web-crawler',
    timestamp: new Date('2024-05-10T16:00:00Z').toISOString(),
    isMock: true,
    code: `package main

import (
	"fmt"
	"net/http"
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

func (c *Crawler) fetchAndParse(rawURL string) ([]string, error) {
    // Faking the implementation for the mock
	fmt.Printf("Fetching and parsing %s\\n", rawURL)
    if rawURL == "https://example.com" {
        return []string{"https://example.com/page1", "https://othersite.com"}, nil
    }
	return []string{}, nil
}

func (c *Crawler) Crawl(seedURL string) {
	tasks := make(chan string, 100)
	
	c.wg.Add(1)
	tasks <- seedURL

	for i := 0; i < 5; i++ { // 5 workers
		go func() {
			for url := range tasks {
				c.mu.Lock()
				if c.visited[url] {
					c.mu.Unlock()
                    c.wg.Done()
					continue
				}
				c.visited[url] = true
				c.mu.Unlock()

				links, err := c.fetchAndParse(url)
				if err != nil {
					fmt.Printf("Error fetching %s: %v\\n", url, err)
                    c.wg.Done()
					continue
				}

				for _, link := range links {
                    c.wg.Add(1)
					go func(l string) { tasks <- l }(link)
				}
                c.wg.Done()
			}
		}()
	}

    c.wg.Wait()
    close(tasks)
}
`,
    review: {
      score: 60,
      feedback: "The implementation attempts to create a concurrent crawler, but it has several critical flaws in its concurrency model and logic. The use of WaitGroup is incorrect, which will lead to premature termination of the crawl. The management of the task channel and workers is also problematic. Furthermore, it fails to meet key requirements like constraining crawls to the same domain.",
      strengths: [
        "Correctly uses a map protected by a mutex (`visited`) to track and avoid crawling the same URL twice.",
        "Identifies the need for a channel to act as a work queue for URLs.",
        "Attempts to use worker goroutines to process URLs concurrently."
      ],
      areasForImprovement: [
        "The `sync.WaitGroup` is being used incorrectly. `wg.Add(1)` is called, and then `wg.Done()` is called inside the loop, meaning the WaitGroup counter will likely become negative, causing a panic. The `wg.Add` and `wg.Done` calls should be managed carefully around the lifecycle of a task.",
        "Starting new goroutines just to send a link to the `tasks` channel (`go func(l string) { tasks <- l }(link)`) is unnecessary and inefficient. The links can be sent to the channel directly.",
        "The logic for closing the task channel and waiting for the `wg` is flawed. The main `Crawl` function will likely exit immediately. A more robust mechanism is needed to know when all work is truly done.",
        "The crawler does not check if links are on the same domain as the seed URL, which is a core requirement.",
        "The worker goroutines will exit as soon as the initial seed URL is processed, as there is no mechanism to keep them alive while new tasks are being discovered."
      ]
    }
  }
};