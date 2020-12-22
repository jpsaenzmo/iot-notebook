from ipykernel.kernelbase import Kernel


class ArduinoKernel(Kernel):
    implementation = 'Arduino'
    implementation_version = '1.0'
    language = 'no-op'
    language_version = '0.1'
    language_info = {
        'name': 'Any text',
        'mimetype': 'text/plain',
        'file_extension': '.txt',
    }
    banner = "Arduino kernel - as useful as a parrot"

    def __init__(self, **kwargs):
        Kernel.__init__(**kwargs)
        self._start_bash()

    def _start_bash(self):
        from pexpect import replwrap
        import signal

        sig = signal.signal(signal.SIGINT, signal.SIG_DFL)
        try:
            self.bash_wrapper = replwrap.bash()
        finally:
            signal.signal(signal.SIGINT, sig)

    def do_execute(self, code, silent, store_history=True, user_expressions=None,
                   allow_stdin=False):
        from pexpect import EOF
        # Empty cell
        if not code.strip():
            return {
                'status': 'OK',
                'execution_count': self.execution_count,
                'payload': [],
                'user_expressions': {}
            }
        # Non-empty cell
        interrupted = False
        try:
            output = self.bash_wrapper.run_command(code.rstrip(), timeout=None)
        except KeyboardInterrupt:
            self.bash_wrapper.child.sendintr()
            interrupted = True
            self.bash_wrapper._expect_prompt()
            output = self.bash_wrapper.child.before
        except EOF:
            output = self.bash_wrapper.child.before + 'Restarting Bash'
            self._start_bash()
        # If expecting output
        if not silent:
            stream_content = {'name': 'stdout', 'text': output}
            self.send_response(self.iopub_socket, 'stream', stream_content)
        # If interrupted
        if interrupted:
            return {'status': 'abort', 'execution_count': self.execution_count}
        # If something has errored out
        try:
            exitcode = int(self.bash_wrapper.run_command('echo $?').rstrip())
        except Exception:
            exitcode = 1

        if exitcode:
            error_content = {'execution_count': self.execution_count, 'ename': '', 'evalue': str(exitcode), 'traceback': []}
            self.send_response(self.iopub_socket, 'error', error_content)
            error_content['status'] = 'error'
            return error_content
        # If everything is OK
        else:
            return {'status': 'ok', 'execution_count': self.execution_count, 'payload': [], 'user_expressions': {}}