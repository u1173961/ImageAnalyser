<div class="messages">
	@isset ($message)
		<div class="message {{ !$error ? 'success-msg' : 'error-msg'}}"><p>{{ $message }}</p></div>
		<div class="message {{ !$error ? 'error-msg hidden' : 'success-msg hidden'}}"><p></p></div>
	@else
		<div class="error-msg message hidden"><p></p></div>
		<div class="success-msg message hidden"><p></p></div>
	@endisset
</div>