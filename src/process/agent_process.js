import { Agent } from '../agent/agent.js';
import { mainProxy } from './main_proxy.js';

export class AgentProcess {
    constructor() {
        this.running = false;
        this.agent = null;
        this.profile = null;
        this.count_id = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    get shouldRetry() {
        return this.retryCount < this.maxRetries;
    }

    async start(profile, load_memory=false, init_message=null, count_id=0, task_path=null, task_id=null) {
        this.profile = profile;
        this.count_id = count_id;

        try {
            console.log('Starting agent with profile:', profile);
            this.agent = new Agent();
            await this.agent.start(profile, load_memory, init_message, count_id, task_path, task_id);
            this.running = true;
            this.retryCount = 0; // Reset retry count on successful start
        } catch (error) {
            this.running = false;
            mainProxy.logoutAgent(this.name);
            console.error('Agent failed:', error);
            
            if (this.shouldRetry) {
                this.retryCount++;
                console.log(`Retrying... Attempt ${this.retryCount} of ${this.maxRetries}`);
                await this.start(profile, true, 'Agent restarted after error', count_id, task_path, task_id);
            } else {
                throw new Error(`Agent failed to start after ${this.maxRetries} attempts: ${error.message}`);
            }
        }
    }

    async stop() {
        if (!this.running) return;
        
        try {
            this.running = false;
            if (this.agent) {
                await this.agent.stop();
                await this.cleanup();
            }
        } catch (error) {
            console.error('Error during agent shutdown:', error);
        } finally {
            mainProxy.logoutAgent(this.name);
            this.agent = null;
        }
    }

    async continue() {
        if (!this.running) {
            await this.start(this.profile, true, 'Agent process restarted.', this.count_id);
        }
    }

    async cleanup() {
        // Add any necessary cleanup logic
        // For example: closing connections, clearing caches, etc.
    }
}